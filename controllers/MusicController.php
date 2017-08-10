<?php

namespace Starbound
{
    class MusicController
    {
        public function music(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $tracks = array(
                array('src' => 'Horsehead-Nebula.mp3', 'name' => 'Horsehead Nebula'),
                array('src' => 'Glitch.mp3', 'name' => 'Glitch'),
                array('src' => 'Epsilon-Indi.mp3', 'name' => 'Epsilon-Indi'),
                array('src' => 'Cygnus-X1.mp3', 'name' => 'Cygnus-X1'),
                array('src' => 'Altair.mp3', 'name' => 'Altair'),
                array('src' => 'Psyche.mp3', 'name' => 'Psyche'),
                array('src' => 'Procyon.mp3', 'name' => 'Procyon'),
                array('src' => 'On-The-Beach-At-Night.mp3', 'name' => 'On The Beach At Night'),
                array('src' => 'Mira.mp3', 'name' => 'Mira'),
                array('src' => 'Large-Magellanic-Cloud.mp3', 'name' => 'Large Magellanic Cloud'),
                array('src' => 'Inviolate.mp3', 'name' => 'Inviolate'),
                array('src' => 'Hymn-to-the-Stars.mp3', 'name' => 'Hymn to the Stars'),
                array('src' => 'Tranquility-Base.mp3', 'name' => 'Tranquility-Base'),
                array('src' => 'Temple-of-Kluex.mp3', 'name' => 'Temple of Kluex'),
                array('src' => 'Blue-Straggler.mp3', 'name' => 'Blue Straggler'),
                array('src' => 'Europa.mp3', 'name' => 'Europa')




            );
            return getPage($app, $request, 'pages/music.twig', 'Музыка Starbound / OST Starbound', array('tracks' => $tracks));
        }
        
    }   
}

?>