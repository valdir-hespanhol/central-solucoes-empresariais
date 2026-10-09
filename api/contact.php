<?php
/**
 * API Segura para Disparo de E-mails do Formulário de Contato
 * Central Soluções Empresariais
 * Destinatário Oficial: contato@soucentral.com.br
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

// 1. Validação de Origem / CORS Restrito
$allowedHosts = ['soucentral.com.br', 'www.soucentral.com.br', 'localhost', '127.0.0.1'];
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$referer = $_SERVER['HTTP_REFERER'] ?? '';

$isAllowedOrigin = false;
foreach ($allowedHosts as $host) {
    if (strpos($origin, $host) !== false || strpos($referer, $host) !== false) {
        $isAllowedOrigin = true;
        break;
    }
}

if ($isAllowedOrigin && !empty($origin)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Aceita apenas requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido']);
    exit;
}

// 2. Proteção contra Bots e Scrapers Agressivos
$userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
if (empty($userAgent) || preg_match('/(sqlmap|nikto|wpscan|curl|python-requests|scrapy|harvest|grabber)/i', $userAgent)) {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Requisição bloqueada por segurança']);
    exit;
}

// 3. Leitura e Decodificação dos Dados (JSON ou Form POST)
$rawInput = file_get_contents('php://input');
$data = [];

if (!empty($rawInput)) {
    $decoded = json_decode($rawInput, true);
    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
        $data = $decoded;
    }
}

if (empty($data) && !empty($_POST)) {
    $data = $_POST;
}

// 4. Verificação de Honeypot Anti-Spam
$honeypot = $data['b_website'] ?? $data['website'] ?? $data['url_check'] ?? '';
if (!empty($honeypot)) {
    // É um bot spammer preenchendo campo oculto. Responde sucesso falso sem disparar e-mail.
    echo json_encode(['success' => true, 'message' => 'Mensagem processada com sucesso']);
    exit;
}

// 5. Sanitização e Validação dos Campos
$nome = trim(strip_tags($data['nome'] ?? ''));
$email = trim(filter_var($data['email'] ?? '', FILTER_SANITIZE_EMAIL));
$telefone = trim(strip_tags($data['telefone'] ?? ''));
$empresa = trim(strip_tags($data['empresa'] ?? ''));
$servico = trim(strip_tags($data['servico'] ?? ''));
$mensagem = trim(strip_tags($data['mensagem'] ?? ''));
$origem = trim(strip_tags($data['origem'] ?? 'Site Central Soluções Empresariais'));

if (empty($nome)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor, informe seu nome completo']);
    exit;
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor, informe um endereço de e-mail válido']);
    exit;
}

if (empty($telefone)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Por favor, informe um telefone de contato']);
    exit;
}

// 6. Limitação de Taxa Simples (Rate Limiting por IP para evitar spam)
$clientIp = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
if (strpos($clientIp, ',') !== false) {
    $clientIp = trim(explode(',', $clientIp)[0]);
}

$rateLimitDir = __DIR__ . '/../data/ratelimit';
if (!is_dir($rateLimitDir)) {
    @mkdir($rateLimitDir, 0755, true);
}
$ipHash = md5($clientIp);
$rateFile = $rateLimitDir . '/' . $ipHash . '.json';
$now = time();

if (file_exists($rateFile)) {
    $rateData = json_decode(@file_get_contents($rateFile), true) ?: ['count' => 0, 'first' => $now];
    if ($now - $rateData['first'] < 300) { // Janela de 5 minutos
        if ($rateData['count'] >= 6) { // Máximo de 6 envios por 5 minutos
            http_response_code(429);
            echo json_encode(['success' => false, 'message' => 'Muitas mensagens enviadas em pouco tempo. Por favor, aguarde alguns minutos ou fale diretamente pelo WhatsApp.']);
            exit;
        }
        $rateData['count']++;
    } else {
        $rateData = ['count' => 1, 'first' => $now];
    }
} else {
    $rateData = ['count' => 1, 'first' => $now];
}
@file_put_contents($rateFile, json_encode($rateData));

// Formatação do link para WhatsApp direto
$telClean = preg_replace('/\D/', '', $telefone);
if (strlen($telClean) === 10 || strlen($telClean) === 11) {
    $whatsappUrl = 'https://wa.me/55' . $telClean;
} else {
    $whatsappUrl = 'https://wa.me/' . $telClean;
}

// Data e Hora de Brasília
date_default_timezone_set('America/Sao_Paulo');
$dataHora = date('d/m/Y \à\s H:i:s');

// 7. Montagem do E-mail Estruturado em HTML
$destinatario = 'contato@soucentral.com.br';
$assunto = '[Novo Contato Site] ' . $nome . ' - ' . (!empty($servico) ? $servico : 'Proposta Geral');

$nomeEscaped = htmlspecialchars($nome, ENT_QUOTES, 'UTF-8');
$empresaEscaped = !empty($empresa) ? htmlspecialchars($empresa, ENT_QUOTES, 'UTF-8') : 'Não informado';
$emailEscaped = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
$telefoneEscaped = htmlspecialchars($telefone, ENT_QUOTES, 'UTF-8');
$servicoEscaped = !empty($servico) ? htmlspecialchars($servico, ENT_QUOTES, 'UTF-8') : 'Geral / Não especificado';
$mensagemEscaped = !empty($mensagem) ? nl2br(htmlspecialchars($mensagem, ENT_QUOTES, 'UTF-8')) : 'Nenhuma observação adicional enviada.';
$origemEscaped = htmlspecialchars($origem, ENT_QUOTES, 'UTF-8');

$corPrimaria = '#120C0E';
$corOuro = '#DAB78D';
$corOuroEscuro = '#8C6233';

$corpoHtml = <<<HTML
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Novo Contato Recebido</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8F6F3; margin: 0; padding: 24px; color: #1F191B; }
    .wrapper { max-width: 620px; margin: 0 auto; background: #FFFFFF; border-radius: 14px; overflow: hidden; border: 1px solid #E8E4DF; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
    .header { background: #120C0E; padding: 32px 28px; text-align: center; border-bottom: 3px solid #DAB78D; }
    .header h1 { color: #FFFFFF; font-size: 20px; margin: 0 0 6px; font-weight: 700; letter-spacing: 0.5px; }
    .header p { color: #DAB78D; font-size: 13px; margin: 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .content { padding: 32px 28px; }
    .badge { display: inline-block; background: rgba(218, 183, 141, 0.2); color: #8C6233; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
    .info-table td { padding: 12px 14px; border-bottom: 1px solid #F0ECE7; font-size: 14px; vertical-align: top; }
    .info-table td.label { width: 35%; font-weight: 700; color: #6E676A; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; }
    .info-table td.value { width: 65%; color: #120C0E; font-weight: 500; }
    .message-box { background: #FBF9F7; border-left: 4px solid #DAB78D; padding: 16px 18px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.6; color: #2D2529; margin-bottom: 24px; }
    .btn-action { display: inline-block; background: #25D366; color: #FFFFFF !important; text-decoration: none; padding: 10px 18px; border-radius: 6px; font-size: 13px; font-weight: 700; margin-top: 6px; }
    .footer { background: #F8F6F3; padding: 20px 28px; font-size: 12px; color: #8C8488; text-align: center; border-top: 1px solid #E8E4DF; }
    .footer p { margin: 4px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <p>Central Soluções Empresariais</p>
      <h1>Novo Lead Recebido pelo Site</h1>
    </div>
    
    <div class="content">
      <span class="badge">Origem: {$origemEscaped}</span>
      
      <table class="info-table">
        <tr>
          <td class="label">Nome Completo</td>
          <td class="value"><strong>{$nomeEscaped}</strong></td>
        </tr>
        <tr>
          <td class="label">Empresa</td>
          <td class="value">{$empresaEscaped}</td>
        </tr>
        <tr>
          <td class="label">E-mail de Contato</td>
          <td class="value"><a href="mailto:{$emailEscaped}" style="color: #8C6233; text-decoration: underline;">{$emailEscaped}</a></td>
        </tr>
        <tr>
          <td class="label">Telefone / WhatsApp</td>
          <td class="value">
            <strong>{$telefoneEscaped}</strong><br>
            <a href="{$whatsappUrl}" target="_blank" class="btn-action">Conversar no WhatsApp</a>
          </td>
        </tr>
        <tr>
          <td class="label">Serviço de Interesse</td>
          <td class="value"><span style="color: #8C6233; font-weight: 700;">{$servicoEscaped}</span></td>
        </tr>
      </table>

      <div style="font-weight: 700; font-size: 12px; color: #6E676A; text-transform: uppercase; margin-bottom: 8px;">Mensagem / Detalhes:</div>
      <div class="message-box">
        {$mensagemEscaped}
      </div>
    </div>

    <div class="footer">
      <p>Data e Hora do Envio: <strong>{$dataHora}</strong> | IP de Origem: <code>{$clientIp}</code></p>
      <p>Este e-mail foi gerado automaticamente através do formulário oficial em <a href="https://soucentral.com.br" style="color: #8C6233;">soucentral.com.br</a></p>
      <p>Para responder ao cliente, basta clicar em <em>Responder</em> (Reply-To configurado para {$emailEscaped}).</p>
    </div>
  </div>
</body>
</html>
HTML;

// Texto puro alternativo para clientes sem suporte HTML
$corpoTexto = "NOVO CONTATO RECEBIDO PELO SITE - CENTRAL SOLUÇÕES EMPRESARIAIS\n\n"
            . "Nome: {$nome}\n"
            . "Empresa: " . (!empty($empresa) ? $empresa : 'Não informado') . "\n"
            . "E-mail: {$email}\n"
            . "Telefone/WhatsApp: {$telefone}\n"
            . "Serviço de Interesse: " . (!empty($servico) ? $servico : 'Geral') . "\n"
            . "Origem: {$origem}\n"
            . "Data/Hora: {$dataHora}\n"
            . "IP: {$clientIp}\n\n"
            . "Mensagem:\n{$mensagem}\n";

// 8. Headers do E-mail
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=UTF-8\r\n";
$headers .= "From: Central Solucoes Empresariais <contato@soucentral.com.br>\r\n";
$headers .= "Reply-To: {$nome} <{$email}>\r\n";
$headers .= "Return-Path: contato@soucentral.com.br\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1 (Highest)\r\n";

// 9. Gravação de Backup em data/contacts.json (Segurança: nenhum lead se perde)
$contactsFile = __DIR__ . '/../data/contacts.json';
$contactRecord = [
    'id' => 'lead_' . time() . '_' . rand(1000, 9999),
    'data_hora' => $dataHora,
    'timestamp' => $now,
    'nome' => $nome,
    'empresa' => $empresa,
    'email' => $email,
    'telefone' => $telefone,
    'servico' => $servico,
    'mensagem' => $mensagem,
    'origem' => $origem,
    'ip' => $clientIp
];

$existingContacts = [];
if (file_exists($contactsFile)) {
    $existingContacts = json_decode(@file_get_contents($contactsFile), true) ?: [];
}
array_unshift($existingContacts, $contactRecord);
// Mantém os últimos 1000 contatos
if (count($existingContacts) > 1000) {
    $existingContacts = array_slice($existingContacts, 0, 1000);
}
@file_put_contents($contactsFile, json_encode($existingContacts, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

// 10. Disparo do E-mail via função mail()
$mailSent = false;
try {
    // Parâmetro adicional -f para definir envelope sender
    $mailSent = @mail($destinatario, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpoHtml, $headers, '-fcontato@soucentral.com.br');
    if (!$mailSent) {
        // Tentativa de fallback sem parâmetro extra caso o servidor restrinja
        $mailSent = @mail($destinatario, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpoHtml, $headers);
    }
} catch (Exception $e) {
    $mailSent = false;
}

// Resposta JSON ao frontend
echo json_encode([
    'success' => true,
    'mail_sent' => $mailSent,
    'message' => 'Sua mensagem foi enviada com sucesso! Nossa equipe entrará em contato em breve.'
]);
