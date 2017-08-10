<?php

namespace Starbound
{
    class ServerController
    {
        public function server(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            return getPage($app, $request, 'pages/server.twig', 'Сервер Starbound');
        }
    }
}

?>