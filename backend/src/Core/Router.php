<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, callable $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function dispatch(string $method, string $uri): void
    {
        $path = $this->pathFromUri($uri);

        if ($method === 'GET' && isset($_GET['id']) && $path === '/api/vehicles') {
            $path = '/api/vehicles/' . (int) $_GET['id'];
        }

        foreach ($this->routes[$method] ?? [] as $route) {
            $pattern = preg_replace('#\{[a-zA-Z_]+\}#', '([^/]+)', $route['path']);

            if (preg_match('#^' . $pattern . '$#', $path, $matches)) {
                array_shift($matches);
                $route['handler'](...$matches);
                return;
            }
        }

        Response::json(['message' => 'Route introuvable'], 404);
    }

    private function add(string $method, string $path, callable $handler): void
    {
        $this->routes[$method][] = [
            'path' => $this->normalize($path),
            'handler' => $handler,
        ];
    }

    private function pathFromUri(string $uri): string
    {
        $path = parse_url($uri, PHP_URL_PATH) ?: '/';
        $path = preg_replace('#^.*?/backend#', '', $path) ?? $path;
        $path = preg_replace('#\.php$#', '', $path) ?? $path;

        return $this->normalize($path);
    }

    private function normalize(string $path): string
    {
        $path = '/' . trim($path, '/');

        return $path === '/' ? '/' : rtrim($path, '/');
    }
}
