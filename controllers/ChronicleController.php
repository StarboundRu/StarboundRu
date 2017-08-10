<?php


namespace Starbound
{
    class ChronicleController {
        public function issue(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $issue) {
            $issue = (int)$issue;
            return getPage($app, $request, 'chronicle/issue'.$issue.'.twig', 'Хроники Starbound по-русски'); 
        }
    }
}

?>
