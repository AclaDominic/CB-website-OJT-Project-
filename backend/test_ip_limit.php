<?php
$url = 'http://127.0.0.1:8000/login';
$data = ['email' => 'admin@example.com', 'password' => 'wrongpassword'];

// 1. Get CSRF Cookie
$ch = curl_init('http://127.0.0.1:8000/sanctum/csrf-cookie');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HEADER, true);
$response = curl_exec($ch);
$header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
$header = substr($response, 0, $header_size);
curl_close($ch);

// 2. Extract cookes from Header
$cookies = [];
preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $response, $matches);
foreach ($matches[1] as $item) {
    parse_str($item, $cookie);
    $cookies = array_merge($cookies, $cookie);
}

$xsrfToken = isset($cookies['XSRF-TOKEN']) ? trim(urldecode($cookies['XSRF-TOKEN'])) : '';
$cookieString = implode('; ', $matches[1]);

// 3. Initiate Login Requests rapidly
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-Requested-With: XMLHttpRequest',
    'X-XSRF-TOKEN: ' . $xsrfToken,
    'Cookie: ' . $cookieString
]);

echo "Simulating 6 extremely rapid failed login attempts using cURL...\n";
for ($i = 1; $i <= 6; $i++) {
    $result = curl_exec($ch);
    $httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "Attempt $i - HTTP $httpcode\nResponse: $result\n\n";

    // We do NOT sleep here, forcing a sub-1-second barrage of requests.
}
curl_close($ch);
