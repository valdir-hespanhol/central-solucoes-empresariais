<?php
/**
 * API Segura para Gestão de Categorias do Blog
 * Proteção contra CSRF, bots e requisições não autorizadas
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');

// Validação de Origem / CORS Restrito
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
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, X-Admin-Auth, X-Requested-With');
}

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

$dataFile = __DIR__ . '/../data/categories.json';

// Leitura pública das categorias
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode([]);
    }
    exit;
}

// Gravação restrita (Apenas POST autorizado)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // 1. Bloqueio de bots sem User-Agent ou com scanners
    $userAgent = $_SERVER['HTTP_USER_AGENT'] ?? '';
    if (empty($userAgent) || preg_match('/(sqlmap|nikto|wpscan|curl|python-requests|scrapy)/i', $userAgent)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Acesso negado']);
        exit;
    }

    // 2. Validação do Token de Autorização do Administrador
    $expectedToken = 'c38944657_central_sec_token_2026';
    $receivedToken = $_SERVER['HTTP_X_ADMIN_AUTH'] ?? '';

    if ($receivedToken !== $expectedToken) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Não autorizado. Autenticação obrigatória.']);
        exit;
    }

    // 3. Limite de tamanho de payload (máximo 1MB)
    $input = file_get_contents('php://input');
    if (strlen($input) > 1 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['success' => false, 'message' => 'Arquivo excede o tamanho permitido']);
        exit;
    }

    $decoded = json_decode($input, true);

    if ($decoded !== null && is_array($decoded)) {
        if (!is_dir(dirname($dataFile))) {
            mkdir(dirname($dataFile), 0755, true);
        }
        file_put_contents($dataFile, json_encode($decoded, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        echo json_encode(['success' => true, 'message' => 'Categorias salvas com segurança']);
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Formato JSON inválido']);
    }
    exit;
}

http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Método não permitido']);
exit;
