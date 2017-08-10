<?php
require_once __DIR__.'/../vendor/autoload.php';

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;


// define vk id and secret
define('VK_API_ID', 00000000);
define('VK_API_SECRET', 'vksecret');
define('DEBUG', false);

require_once __DIR__.'/../classes/User.php';

$app = new Silex\Application();
$app['debug'] = false;

$app->register(new Silex\Provider\TwigServiceProvider(), array(
    'twig.path' => __DIR__.'/views',
    'twig.class_path' => __DIR__ . '/vendor/twig/lib'
));
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options'            => array(
        'driver'    => 'pdo_mysql',
        'dbname'      => 'dbname',
        'host' => 'dbhost',
        'user' => 'user',
        'password' => 'pass',
        'charset' => 'utf8'
    ),
));
$app->register(new Silex\Provider\UrlGeneratorServiceProvider());
$app->register(new Silex\Provider\SessionServiceProvider(), array(
    'session.storage.options' => array(
        'cookie_lifetime' => 3600 * 24 * 30
    )
));


class DeclExtension extends Twig_Extension {
    public function getName() {
        return 'decl';
    }
    public function getFilters()
    {
        return array(
            new Twig_SimpleFilter('decl', array($this, 'decl')),
        );
    }
    public function decl($number, $text1,$text2,$text5) {
        if ($number % 100 >= 10 && $number % 100 <= 19) $res = $text5;
        elseif ($number % 10 == 1) $res = $text1;
        elseif (($number % 10 >= 5 && $number % 10 <= 9) || $number % 10 == 0) $res = $text5;
        else $res = $text2;
        
        return $number.' '.$res;
    }
}

if (isset($app['twig'])) {
    $oldTwig = $app->raw('twig');
    $app['twig'] = $app->share(function($c) use ($oldTwig, $app) {
        $twig = $oldTwig($c);
        $twig->addExtension(new DeclExtension($app));

        return $twig;
    });
}


$user_id = $app['session']->get('user_id');
$user = null;
if ($user_id) {
    $sql = "select * from users where user_id = :user_id";
    $userrow = $app['db']->fetchAll($sql, array('user_id' => $user_id));
    if ($userrow) {
        $user = new \Starbound\User($userrow[0], null);
        $user->visit();
    }
    else {
        $user_id = 0;
    }
}
if ($user === null) $user = new \Starbound\User(null, null);
$app['user'] = $user;


function getPage($app, $request, $template, $title, $data = array()) {
    $content = $app['twig']->render($template, $data);
    if ($request->get('ajax')) {
        return $app->json(array('html' => $content, 'title' => $title));
    }
    return $app['twig']->render('base.twig', array(
        'content' => $content,
        'title' => $title,
        'vk_api_id' => VK_API_ID,
        'debug' => DEBUG
    ));
}

function sendMail($app, $template, $to, $subject, $data = array()) {
    $data['subject'] = $subject;
    $content_html = $app['twig']->render('emails/'.$template.'.twig.html', $data);
    $content_text = $app['twig']->render('emails/'.$template.'.twig.txt', $data);
                 
    $transport = Swift_MailTransport::newInstance();
    $mailer = Swift_Mailer::newInstance($transport);
    $message = Swift_Message::newInstance($subject);
    $message->setBody($content_html, 'text/html');
    $message->addPart($content_text, 'text/plain');
    $message->setTo($to);
    $message->setFrom(array('robot@starbound.ru' => 'Starbound.ru'));
    $numSent = $mailer->send($message);
}

require_once(__DIR__ .'/../controllers/PostController.php');
require_once(__DIR__ .'/../controllers/PageController.php');
require_once(__DIR__ .'/../controllers/ChronicleController.php');
require_once(__DIR__ .'/../controllers/UserController.php');
require_once(__DIR__ .'/../controllers/WallpaperController.php');
require_once(__DIR__ .'/../controllers/MonstersController.php');
require_once(__DIR__ .'/../controllers/MusicController.php');
require_once(__DIR__ .'/../controllers/ServerController.php');

$app->get('/', 'Starbound\PostController::allPosts')->bind('index');
$app->get('/post/{hrl}/', 'Starbound\PostController::post')->bind('post');
$app->post('/post/', 'Starbound\PostController::add_post');

$app->get('/users/', 'Starbound\UserController::users')->bind('users');
$app->get('/user/{username}/', 'Starbound\UserController::user')->bind('user');
$app->post('/auth/{appid}/{command}/', 'Starbound\UserController::check');
$app->get('/activate/{code}', 'Starbound\UserController::activate')->bind('activate');
$app->get('/activate/preview/{template}', function(Request $req, $template) use ($app) {
  return $content_html = $app['twig']->render('emails/'.$template.'.twig.html', array('subject' => 'subj', 'code' => 'code'));
});
$app->post('/sign/',  'Starbound\UserController::sign')->bind('sign');

$app->get('/page/{hrl}/', 'Starbound\PageController::page')->bind('page');
$app->get('/about/', 'Starbound\PageController::about')->bind('about');
$app->get('/faq/', 'Starbound\PageController::faq')->bind('faq');
$app->get('/download/', 'Starbound\PageController::download')->bind('download');

$app->get('/chronicle/issue{issue}/', 'Starbound\ChronicleController::issue')->bind('chronicle');

$app->get('/wallpaper/', 'Starbound\WallpaperController::wallpapers')->bind('wallpaper');
$app->get('/monsters/', 'Starbound\MonstersController::monsters')->bind('monsters');
$app->get('/music/', 'Starbound\MusicController::music')->bind('music');

$app->get('/server/', 'Starbound\ServerController::server')->bind('server');

$app->get('/forumd/', 'Starbound\ForumController::forum')->bind('forumd');

$app->get('/forum/', function(Request $request) use ($app) { 
    return getPage($app, $request, 'pages/forum.twig', 'Форум Starbound');
})->bind('forum');

//
//$app->get('/screenshots/', function(Request $request) use ($app) { 
//    return getPage($app, $request, 'pages/screenshots.twig', 'Скриншоты Starbound');
//})->bind('screenshots');
//$app->get('/video/', function(Request $request) use ($app) { 
//    return getPage($app, $request, 'pages/video.twig', 'Видео Starbound');
//})->bind('video');


$app->match('/subscribe/', function(Request $request) use ($app) { 
    $error = null;
    $subs = $app['session']->get('subs', array(
        'news' => true,
        'translate' => false,
        'release' => false
    ));
    $email = $app['session']->get('email', '');
    $subscribed = false;
    $unsubscribed = false;
    
    if ($email) foreach ($subs as $sub => $value) {
        if ($value) $subscribed = true;
    }
    
    if ($request->getMethod() == 'POST') {
        $email = $request->get('email');
        if (preg_match('/^[-a-z0-9!#$%&\'*+\\/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&\'*+\\/=?^_\`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i', $email)) {
            $subs_cnt = 0;
            foreach ($subs as $sub => $value) {
                if ($request->get($sub)) {
                    $subs[$sub] = true;
                    $subs_cnt++;
                }
                else {
                    $subs[$sub] = false;
                }
            }
            $app['db']->delete('emails', array('email' => $email));
            if ($subs_cnt) {
                $subscribed = true;
                
                $app['session']->set('email', $email);
                $app['session']->set('subs', $subs);
                
                $app['db']->insert('emails', array(
                    'email' => $email,
                    'ip' => $_SERVER['REMOTE_ADDR'],
                    'dt' => date('Y-m-d H:i:s'),
                    'subs_news' => (int)$subs['news'],
                    'subs_release' => (int)$subs['release'],
                    'subs_translate' => (int)$subs['translate']
                ));
            }
            else {
                //$error = 'Необходимо выбрать хотя бы один пункт подписки';
                $subscribed = false;
                $unsubscribed = true;
                $app['session']->set('subs', $subs);
                $app['session']->set('email', '');
            }
        }
        else {
            $error = 'Неверный E-mail адрес';
        }
    }
    
    return getPage($app, $request, 'pages/subscribe.twig', 'Подписка на новости Starbound', array('subscribed' => $subscribed, 'error' => $error, 'subs' => $subs, 'email' => $email, 'unsubscribed' => $unsubscribed));
})->method('POST|GET')->bind('subscribe');

$app->error(function (\Exception $e, $code) use($app) {
    $request = $app['request'];
    return new Response(
            getPage($app, $request, 'error.twig', 'Starbound. Ошибка.', array('code' => $code, 'error' => $e)),
            $code
    );
});

function logEvent($event) {
    global $app;
    $app['db']->insert('log', array(
        'log_event' => $event,
        'dt' => date('Y-m-d H:i:s'),
        'ip' => $_SERVER['REMOTE_ADDR'],
        'user_id' => $app['user']->getId()
    ));
}

$app->run();
