<?php

// Uses dependencies inside this checkout; never bootstraps a consumer app/.env.
$loader = require __DIR__.'/../vendor/autoload.php';
$loader->setPsr4('NotaAgil\\Integration\\', __DIR__.'/../src');
$loader->setPsr4('NotaAgil\\Integration\\Tests\\', __DIR__);
// A copied optimized vendor can contain a classmap for an older SDK release.
// Resolve this checkout's classes before that classmap as well as its PSR-4 map.
foreach ($loader->getClassMap() as $class => $path) {
    $prefix = 'NotaAgil\\Integration\\';
    if (str_starts_with($class, $prefix)) {
        $local = __DIR__.'/../src/'.str_replace('\\', '/', substr($class, strlen($prefix))).'.php';
        if (is_file($local)) {
            $loader->addClassMap([$class => $local]);
        }
    }
}
