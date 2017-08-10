<?php

namespace Starbound
{
    class WallpaperController
    {
        public function wallpapers(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $wallpapers = array(
                'deerthingwall' => array(
                    'name' => 'Nomad',
                    'author' => 'Fetalstar',
                    'path' => '2012/02/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x900', '1680x1050', '1920x1080'),
                    'type' => 'jpg'
                ),
                'orbswamp' => array(
                    'name' => 'Unfamiliar Territory',
                    'author' => 'Fetalstar',
                    'path' => '2012/02/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'alienreef-' => array(
                    'name' => 'Unknown Currents',
                    'author' => 'Fetalstar',
                    'path' => '2012/03/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'crystalforest-' => array(
                    'name' => 'Shards and Shortcuts',
                    'author' => 'Fetalstar',
                    'path' => '2012/03/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'lizardwheelie-' => array(
                    'name' => 'Dino-mite',
                    'author' => 'Fetalstar',
                    'path' => '2012/03/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'mechgirl' => array(
                    'name' => 'Tune Up',
                    'author' => 'Fetalstar',
                    'path' => '2012/03/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'contestwinners-' => array(
                    'name' => 'Anomalous Readings',
                    'author' => 'Fetalstar',
                    'path' => '2012/04/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'tentaclebattle-' => array(
                    'name' => 'Tentacles Suck',
                    'path' => '2012/05/',
                    'size' => array('1024x576', '1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'avian-' => array(
                    'name' => 'You Shall Not Pass!',
                    'path' => '2012/06/',
                    'size' => array('1024x576', '1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'ymedronguest-' => array(
                    'author' => 'Ymedron',
                    'author_url' => array('http://umbbe.deviantart.com/', 'http://community.playstarbound.com/index.php?threads/ymedron-and-the-art.3911/'),
                    'name' => 'SpaceCat’s Great Escape',
                    'path' => '2012/07/',
                    'size' => array('1024x576', '1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'dragonithwall-' => array(
                    'author' => 'Dragonith',
                    'author_url' => 'http://dragonith.deviantart.com/',
                    'name' => 'Gotta Shoot ‘Em All',
                    'path' => '2012/09/',
                    'size' => array('1024x576', '1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'skechwall' => array(
                    'name' => 'Октябрь 2012',
                    'author' => 'Skech & Maesma',
                    'author_url' => array('http://darktrigger.deviantart.com/', 'http://captain-maesma.deviantart.com/'),
                    'path' => '2012/10/',
                    'size' => array('1024x576', '1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'seigawall-' => array(
                    'name' => 'Ноябрь 2012',
                    'author' => 'Seiga',
                    'author_url' => 'http://seigaseigas.tumblr.com/tagged/seiga-art',
                    'path' => '2012/12/',
                    'size' => array('1024x768', '1280x800', '1366x768', '1440x900', '1600x1200', '1600x900', '1680x1050', '1920x1080', '1920x1200'),
                    'type' => 'jpg'
                ),
                'suikawall-' => array(
                    'name' => 'Февраль 2013',
                    'author' => 'Suika Ibuki',
                    'author_profile' => 'http://community.playstarbound.com/index.php?members/suika-ibuki.172/',
                    'author_url' => 'http://suweeka.deviantart.com/',
                    'path' => '2013/02/',
                    'size' => array('1024x768','1280x800','1366x768','1440x900','1600x1200','1600x900','1680x1050','1920x1080','1920x1200'),
                    'type' => 'png'
                ),
                'bietolwall-' => array(
                    'name' => 'Март 2013',
                    'author' => 'Bietol',
                    'author_profile' => 'http://community.playstarbound.com/index.php?members/bietol.10704/',
                    'author_url' => 'http://johnsu.deviantart.com/',
                    'path' => '2013/03/',
                    'size' => array('1024x768','1280x800','1366x768','1440x900','1600x1200','1600x900','1680x1050','1920x1080','1920x1200'),
                    'type' => 'jpg'
                ),
                'andrekentwall-' => array(
                    'name' => 'Апрель 2013',
                    'author' => 'AndreKent',
                    'author_profile' => 'http://community.playstarbound.com/index.php?members/andre-kent.30277/',
                    'author_url' => 'http://adecanto.newgrounds.com/art/',
                    'path' => '2013/04/',
                    'size' => array('1024x768','1280x800','1366x768','1440x900','1600x1200','1600x900','1680x1050','1920x1080','1920x1200'),
                    'type' => 'jpg'
                ),

            );

            $wallpapers =array_reverse($wallpapers);


            return getPage($app, $request, 'pages/wallpaper.twig', 'Обои для рабочего стола Starbound', array(
                'wallpapers' => $wallpapers
            ));
        }
        
    }   
}

?>