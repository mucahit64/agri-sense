<?php
// =====================================================
// Basit HTTP → HTTPS Bridge (SIM808 → Railway)
// =====================================================

// SIM808 için düz text cevap
header("Content-Type: text/plain");

// Sadece POST kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo "ONLY POST ALLOWED";
    exit;
}

// Gelen ham JSON
$rawInput = file_get_contents("php://input");

if (!$rawInput) {
    http_response_code(400);
    echo "NO BODY";
    exit;
}

// JSON decode (kontrol amaçlı)
$data = json_decode($rawInput, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo "INVALID JSON";
    exit;
}

// -----------------------------------------------------
// (Opsiyonel) Basit validasyon
// -----------------------------------------------------
if (
    empty($data['device_uid']) ||
    empty($data['sensor_uid']) ||
    !isset($data['value'])
) {
    http_response_code(400);
    echo "MISSING FIELDS";
    exit;
}

// -----------------------------------------------------
// Railway backend URL
// -----------------------------------------------------
$railwayUrl = "https://agri-sense-production.up.railway.app/api/readings";

// -----------------------------------------------------
// Railway'e forward et
// -----------------------------------------------------
$ch = curl_init($railwayUrl);

curl_setopt_array($ch, [
    CURLOPT_POST            => true,
    CURLOPT_POSTFIELDS      => $rawInput,
    CURLOPT_HTTPHEADER      => [
        "Content-Type: application/json",
        "Content-Length: " . strlen($rawInput),
    ],
    CURLOPT_RETURNTRANSFER  => true,
    CURLOPT_TIMEOUT         => 10,
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

if ($response === false) {
    http_response_code(500);
    echo "RAILWAY CONNECTION FAILED";
    curl_close($ch);
    exit;
}

curl_close($ch);

// -----------------------------------------------------
// SIM808'e sade cevap
// -----------------------------------------------------
if ($httpCode >= 200 && $httpCode < 300) {
    echo "OK";
} else {
    echo "RAILWAY ERROR: " . $httpCode;
}
