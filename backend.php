<?php
function arr($key, $array, $default = null) {
    return isset($array[$key]) ? $array[$key] : $default;
}

function api() {
    if (arr('SCRIPT_NAME', $_SERVER) != '/backend.php' || strpos(arr('CONTENT_TYPE', $_SERVER, ''), 'application/json') === false) {
        return false;
    }
    $api = array_intersect_key(
                json_decode(file_get_contents('php://input'), true), array_flip(array(
              'jsonrpc', 'method', 'id', 'params'
            )));
    
    return $api;
}

function jsonrpc($response, $result, $keys = array(), $err_code = -1, $err_data = null) {
    header('Expires: ' . gmdate('r', 0));
    header('Content-type: application/json');
    $jsonrpc = array(
      'jsonrpc' => '2.0',
      'id' => 1234,
    );
    switch ($result) {
        case 0:
        case 1:
            $keys = array_flip($keys);
            $jsonrpc['result'] = array($keys, $response);
            break;
        case 2:
            $jsonrpc['error'] = array(
              'code' => $err_code,
              'message' => $response,
            );
            if ($err_data !== null) {
                $jsonrpc['error']['data'] = $err_data;
            }
            break;
    }
    print json($jsonrpc);
    exit;
}

function json($var) {
//  return json_encode($var, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_NUMERIC_CHECK);
    return json_encode_php53($var);
}

function json_encode_php53($var) {
    $json = preg_replace_callback('/\\\\u([0-9a-f]{4})/i', function($matches) {
            return mb_convert_encoding(pack('H*', $matches[1]), 'UTF-8', 'UTF-16');
        }, json_encode($var, JSON_NUMERIC_CHECK));
    return $json;
}

function redirect($uri, $status_code = 302) {
    send_header($status_code);
    // Again, why are we doing this? :)
    session_write_close();
    session_regenerate_id(true);
    header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
    header('Location: ' . $uri);
    exit(0);
}

/**
 * Send header.
 * 
 * @param int $status_code
 */
function send_header($status_code) {
    $status_codes = array (
        100 => 'Continue',
        101 => 'Switching Protocols',
        102 => 'Processing',
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative Information',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',
        207 => 'Multi-Status',
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        307 => 'Temporary Redirect',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Timeout',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Requested Range Not Satisfiable',
        417 => 'Expectation Failed',
        422 => 'Unprocessable Entity',
        423 => 'Locked',
        424 => 'Failed Dependency',
        426 => 'Upgrade Required',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway',
        503 => 'Service Unavailable',
        504 => 'Gateway Timeout',
        505 => 'HTTP Version Not Supported',
        506 => 'Variant Also Negotiates',
        507 => 'Insufficient Storage',
        509 => 'Bandwidth Limit Exceeded',
        510 => 'Not Extended',
    );
    if (isset($status_codes[$status_code])) {
        $status_string = "$status_code {$status_codes[$status_code]}";
        header("{$_SERVER['SERVER_PROTOCOL']} $status_string", true, $status_code);
    }
}

if ($api = api()) {
    $servername = "localhost";
    $dbname = "";
    $username = "";
    $password = "";
    try {
        $input = arr('score', $api['params'], 0);
        switch ((string)$input) {
            default:
                $score = 0;
                break;
            case 'friberg':
                $score = 1;
                break;
            case 'pasha':
                $score = 2;
                break;
        }
        $ip = arr('REMOTE_ADDR', $_SERVER);
        $ts = time();
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        // set the PDO error mode to exception
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        if ($score > 0) {
            $stmt = $conn->prepare("INSERT INTO score (score, ip, ts) VALUES (:score, :ip, :ts)");
            $stmt->bindParam(':score', $score, PDO::PARAM_INT);
            $stmt->bindParam(':ip', $ip);
            $stmt->bindParam(':ts', $ts, PDO::PARAM_INT);
            $stmt->execute();
        }
        $stmt = $conn->prepare(' select '
        . ' (select count(*) from score where score = 1) as friberg,'
        . ' (select count(*) from score where score = 2) as pasha,'
        . ' (select count(*) from score) as total'
        . ' from score group by score');
        $stmt->execute();
        $stmt->setFetchMode(PDO::FETCH_ASSOC);
        $score = $stmt->fetchAll();
        $score = $score[0];
    } catch(PDOException $e) {  }
    jsonrpc(array(array_values($score)), 1, array_keys($score));
}
