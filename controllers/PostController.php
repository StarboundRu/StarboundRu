<?php

namespace Starbound
{
    class PostController
    {
        public function allPosts(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $sql = "select * from news where news_type > 0 order by dt desc limit 10";
            $news = $app['db']->fetchAll($sql, array());
            return getPage($app, $request, 'pages/news.twig', 'Starbound. Новости', array('news' => $news));
        }
        
        public function post(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $hrl) {
            $sql = "select * from news where hrl = :hrl order by dt desc";
            $post = $app['db']->fetchAll($sql, array('hrl' => $hrl));
            return getPage($app, $request, 'pages/post.twig', 'Starbound. '.$post[0]['title'], array(
                'post' => $post[0]
            ));
        }

        public function add_post(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            if (!$app['user']->isCanPostNews()) {
                return $app->json(array('result' => 'error'));
            }

            if ($request->get('new')) {
                $hrl = 'post'.date('YmdHis');
                $app['db']->insert('news', array(
                    'dt' => date('Y-m-d H:i:s'),
                    'hrl' => $hrl,
                    'title' => 'Новый пост'
                ));
                $postId = $app['db']->lastInsertId();

                logEvent('new post '.$postId);

                return $app->json(array('url' => '/post/'.$hrl.'/'));
            }
            else {
                $config = \HTMLPurifier_Config::createDefault();
                $config->set('Core.Encoding', 'UTF-8'); // replace with your encoding
                $config->set('HTML.Doctype', 'XHTML 1.0 Transitional'); // replace with your doctype
                $purifier = new \HTMLPurifier($config);

                $configTitle = \HTMLPurifier_Config::createDefault();
                $configTitle->set('Core.Encoding', 'UTF-8'); // replace with your encoding
                $configTitle->set('HTML.Doctype', 'XHTML 1.0 Transitional'); // replace with your doctype
                $configTitle->set('HTML.Allowed', 'i'); // replace with your doctype
                $purifierTitle = new \HTMLPurifier($configTitle);

                $post_id = $request->get('post_id');
                $title = $purifierTitle->purify($request->get('title'));
                $content = $request->get('content');
                $content_safe = $purifier->purify($content);
                $icon = (int)$request->get('icon');
                $news_type = (int)$request->get('news_type');
                $news_source = $request->get('url');
                $hrl = $request->get('hrl');

                logEvent('edit post '.$post_id);


                if (preg_match('{^http://(.*)$}', $news_source, $regs)) {
                    $news_source = $regs[1];
                }
                else {
                    $news_source = '';
                }

                $app['db']->update('news',
                    array(
                        'title' => $title,
                        'content_source' => $content,
                        'content_safe' => $content_safe,
                        'icon' => $icon,
                        'news_type' => $news_type,
                        'news_source' => $news_source,
                        'hrl' => $hrl
                    ),
                    array('news_id' => $post_id)
                );

                return $app->json(array('result' => 'ok'));
            }
        }
    }   
}

?>