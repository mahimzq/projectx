<?php
/**
 * Mindset Watchdog V6 - Node 18 Super-Lean
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

$baseDir = __DIR__;
$standaloneDir = "$baseDir/standalone_run/Desktop/Project/Mindset";
$logFile = "$baseDir/app.log";
$lockFile = "$baseDir/watchdog.lock";
$tmpDir = "$baseDir/tmp_exec";
$port = 3001;

if (!is_dir($tmpDir))
    @mkdir($tmpDir, 0755, true);

$fp = fopen($lockFile, "w");
if (!flock($fp, LOCK_EX | LOCK_NB)) {
    exit("Watchdog already running.\n");
}

function logMessage($msg)
{
    global $logFile;
    $date = date('Y-m-d H:i:s');
    file_put_contents($logFile, "[$date] WATCHDOG: $msg\n", FILE_APPEND);
}

$connection = @fsockopen('127.0.0.1', $port, $errno, $errstr, 1);
if (is_resource($connection)) {
    fclose($connection);
    exit("Server is UP.\n");
}

logMessage("Server is DOWN. Starting Node 18 Super-Lean...");

$node = '/opt/alt/alt-nodejs18/root/usr/bin/node';
$serverJs = "$standaloneDir/server.js";

$env = [
    'PATH' => '/opt/alt/alt-nodejs18/root/usr/bin:/usr/bin:/bin',
    'NODE_ENV' => 'production',
    'PORT' => (string)$port,
    'HOSTNAME' => '127.0.0.1',
    'TMPDIR' => $tmpDir,
    'UV_THREADPOOL_SIZE' => '1',
    'MALLOC_ARENA_MAX' => '2',
    'NODE_OPTIONS' => '--max-old-space-size=48', // Removed --optimize-for-size
    'PRISMA_QUERY_ENGINE_LIBRARY' => "$standaloneDir/node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node"
];

$descriptors = [
    0 => ['pipe', 'r'],
    1 => ['file', $logFile, 'a'],
    2 => ['file', $logFile, 'a']
];

// Launch with absolute minimal flags
$process = proc_open("$node --max-old-space-size=48 $serverJs", $descriptors, $pipes, $standaloneDir, $env);

if (is_resource($process)) {
    $status = proc_get_status($process);
    logMessage("Started Node 18 Super-Lean with PID: " . $status['pid']);
    fclose($pipes[0]);
}

flock($fp, LOCK_UN);
fclose($fp);
?>