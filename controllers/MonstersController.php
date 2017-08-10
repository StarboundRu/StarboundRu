<?php

namespace Starbound
{
    class MonstersController
    {
        public function monsters(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $monsters = array();
            for ($i = 50; $i >= 1; $i--) {
                if ($i == 14 || $i >= 43) {
                    $monsters[$i] = $i.'.gif';
                }
                else {
                    $monsters[$i] = $i.'.png';
                }
            }
            return getPage($app, $request, 'pages/monsters.twig', 'Монстры Starbound', array('monsters' => $monsters));
        }
        
    }   
}

?>