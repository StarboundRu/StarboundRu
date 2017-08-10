<?php

namespace Starbound
{
    class PageController
    {
        public function about(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            return getPage($app, $request, 'pages/about.twig', 'Об игре Starbound');
        }
        public function faq(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            return getPage($app, $request, 'pages/faq.twig', 'FAQ Starbound');
        }
        public function download(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            return getPage($app, $request, 'pages/download.twig', 'Скачать Starbound');
        }
        public function page(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $hrl) {
            $sql = "select * from pages where hrl = :hrl";
            $page = $app['db']->fetchAll($sql, array('hrl' => $hrl));
            return getPage($app, $request, 'pages/page.twig', 'Starbound. '.$page[0]['title'], array(
                'page' => $page[0]
            ));
        }
    }   
}

?>