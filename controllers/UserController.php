<?php

namespace Starbound {
    class UserController {
        public function users(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $sql = "select * from users order by exp desc, age desc, username";
            $user_rows = $app['db']->fetchAll($sql);
            $users = array();
            foreach ($user_rows as $row) {
                $users[] = new \Starbound\User($row, null);
            }
            return getPage($app, $request, 'pages/users.twig', 'Игроки Starbound', array(
                'users' => $users
            ));
        }
        
        public function user(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $username) {
            $username_safe = str_replace(' ', '_', $username);
            if ($username_safe != $username) {
                return $app->redirect($app['url_generator']->generate('user', array('username' => $username_safe)));
            }

            $sql = "select * from users where username_safe = :username";
            $user = $app['db']->fetchAll($sql, array('username' => $username));
            if ($user) {
                $user = new \Starbound\User($user[0], array());

                return getPage($app, $request, 'pages/user.twig', $user->getUsername(), array(
                    'user' => $user
                ));
            }
        }
        
        public function sign(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app) {
            $mode = $request->get('mode');
            $method = $request->get('method');

            $errors = array();
            $user_id = 0;

            if ($mode == 2) {
                $app['session']->set('user_id', 0);
                $app['session']->set('username', '');
                return $app->json(
                    array(
                        'user_id' => 0,
                        'username' => '',
                        'username_safe' => '',
                        'signature' => ''
                    )
                );
            }
            elseif ($mode == 0) {
                // register

                $username = trim($request->get('username'));
                $username_safe = str_replace(' ', '_', $username);
                // check username
                if (mb_strlen($username) < 3 || mb_strlen($username) > 15) {
                    $errors['username'] = 'Имя может быть от трёх до 15 символов.';
                }
                elseif (!preg_match('{^[a-zа-я0-9 _-]{3,15}$}ui', $username)) {
                    $errors['username'] = 'В имени могут быть только буквы и цифры.';
                }
                else {
                    $sql = "select * from users where username = :username or username_safe = :username_safe";
                    $users = $app['db']->fetchAll($sql, array('username' => $username, 'username_safe' => $username_safe));
                    if ($users) {
                        $errors['username'] = 'Такое имя уже занято.';
                    }
                }

                if ($method == 'email') {
                    $email = trim($request->get('email'));
                    if (!preg_match('/^[-a-z0-9!#$%&\'*+\\/=?^_`{|}~]+(?:\.[-a-z0-9!#$%&\'*+\\/=?^_\`{|}~]+)*@(?:[a-z0-9]([-a-z0-9]{0,61}[a-z0-9])?\.)*(?:aero|arpa|asia|biz|cat|com|coop|edu|gov|info|int|jobs|mil|mobi|museum|name|net|org|pro|tel|travel|[a-z][a-z])$/i', $email)) {
                        $errors['email'] = 'Неверный формат E-mail.';
                    }
                    else {
                        $sql = "select * from users where email = :email";
                        $users = $app['db']->fetchAll($sql, array('email' => $email));
                        if ($users) {
                            $errors['email'] = 'Пользователь с таким адресом уже зарегистрирован.';
                        }
                    }

                    $password = trim($request->get('password'));
                    if (mb_strlen($password) < 4 || mb_strlen($password) > 100) {
                        $errors['password'] = 'Пароль должен быть от 4 до 100 символов.';
                    }


                    if (!$errors) {
                        $code = md5(uniqid());
                        $app['db']->insert('email_activations', array(
                            'username' => $username,
                            'username_safe' => $username,
                            'email' => @$email,
                            'password' => $password,
                            'code' => $code
                        ));

                        sendMail($app, 'activate', $email, 'Добро пожаловать на Starbound.ru!', array(
                            'username' => $username,
                            'code' => $code
                        ));

                        return $app->json(array('result' => 'activation'));
                    }
                }
                elseif ($method == 'vk') {
                    $vk_id = $request->get('mid');
                    $md5 = md5(
                            'expire='.$request->get('expire').
                            'mid='.$vk_id.
                            'secret='.$request->get('secret').
                            'sid='.$request->get('sid').
                            VK_API_SECRET
                    );
                    if ($request->get('sig') != $md5) {
                        $errors['vk'] = 'Ошибка авторизации Вконтакте.';
                    }
                    else {
                        $sql = "select * from users where vk_id = :vkid";
                        $users = $app['db']->fetchAll($sql, array('vkid' => $vk_id));
                        if ($users) {
                            //$errors['email'] = 'Вы уже зарегистрированы.';
                            $user_id = $users[0]['user_id'];
                            $username = $users[0]['username'];
                        }
                    }

                    $password = trim($request->get('password'));
                    if (mb_strlen($password) < 4 || mb_strlen($password) > 100) {
                        $errors['password'] = 'Пароль должен быть от 4 до 100 символов.';
                    }

                    if (!$user_id && !$errors) {
                        $app['db']->insert('users', array(
                            'username' => $username,
                            'username_safe' => $username_safe,
                            'password' => md5($password),
                            'password_plain' => $password,
                            'vk_id' => @$vk_id,
                            'date_reg' => date('Y-m-d H:i:s'),
                            'last_visit' => date('Y-m-d H:i:s'),
                            'validated' => 1
                        ));
                        $user_id = $app['db']->lastInsertId();
                    }
                }
                else {
                    $errors['method'] = 'Неизвестный метод.';
                }
            }
            else {
                if ($method == 'email') {
                    $username = $request->get('username');
                    $password = $request->get('password');

                    $sql = "select * from users where username = :username";
                    $users = $app['db']->fetchAll($sql, array('username' => $username));
                    if ($users) {
                        if (md5($password) == $users[0]['password']) {
                            $user_id = $users[0]['user_id'];
                            $username = $users[0]['username'];
                        }
                        else {
                            $errors['email'] = 'Пароль введён неверно.';
                        }
                    }
                    else {
                        $errors['email'] = 'Вы не зарегистрированы.';
                    }
                }
                elseif ($method == 'vk') {
                    $vk_id = $request->get('mid');
                    $md5 = md5(
                            'expire='.$request->get('expire').
                            'mid='.$vk_id.
                            'secret='.$request->get('secret').
                            'sid='.$request->get('sid').
                            VK_API_SECRET
                    );
                    if ($request->get('sig') != $md5) {
                        $errors['password'] = 'Ошибка авторизации Вконтакте.';
                    }
                    else {
                        $sql = "select * from users where vk_id = :vkid";
                        $users = $app['db']->fetchAll($sql, array('vkid' => $vk_id));
                        if ($users) {
                            //$errors['email'] = 'Вы уже зарегистрированы.';
                            $user_id = $users[0]['user_id'];
                            $username = $users[0]['username'];
                        }
                        else {
                            $errors['vk'] = 'Вы не зарегистрированы.';
                        }
                    }
                }
                else {
                    $errors['method'] = 'Неизвестный метод.';
                }
            }

            if ($errors) {
                return $app->json(
                    array(
                        'result' => 'error',
                        'error' => $errors
                    )
                );
            }
            else {
                $app['session']->set('user_id', $user_id);
                $app['session']->set('username', $username);

                $session = $app['session']->getId();
                $signature = md5("$session|$user_id|NJK23nNkl2n309");

                return $app->json(
                    array(
                        'result' => 'success',
                        'user_id' => $user_id,
                        'username' => $username,
                        'username_safe' => str_replace(' ', '_', $username),
                        'signature' => $signature
                    )
                );
            }
        }

        public function activate(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $code) {

            try {
                $app['db']->beginTransaction();

                $sql = "select * from email_activations where code=:code";
                $activation = $app['db']->fetchAll($sql, array('code' => $code));
                $result = 0;

                if (!$activation) {
                    $error = 'Неверный код активации.';
                }
                elseif ($activation[0]['result'] == 0) {
                    $activation_id = $activation[0]['id'];
                    $username = $activation[0]['username'];
                    $username_safe = $activation[0]['username_safe'];
                    $email = $activation[0]['email'];
                    $password = $activation[0]['password'];

                    $sql = "select * from users where username = :username or username_safe = :username_safe";
                    $check = $app['db']->fetchAll($sql, array('username' => $username, 'username_safe' => $username_safe));
                    if ($check) {
                        $result = 2;
                    }
                    else {
                        $sql = "select * from users where email = :email";
                        $check = $app['db']->fetchAll($sql, array('email' => $email));
                        if ($check) {
                            $result = 3;
                        }
                    }

                    if ($result == 0) {
                        $app['db']->insert('users', array(
                            'username' => $username,
                            'username_safe' => $username_safe,
                            'password' => md5($password),
                            'password_plain' => $password,
                            'email' => $email,
                            'date_reg' => date('Y-m-d H:i:s'),
                            'last_visit' => date('Y-m-d H:i:s'),
                            'validated' => 1
                        ));
                        $result = 1;
                    }

                    $app['db']->update('email_activations', array('result' => $result), array('id' => $activation_id));
                }
                else {
                    $result = $activation[0]['result'];
                }

                $app['db']->commit();
            }
            catch (Exception $e) {
                $app['db']->rollback();
                throw $e;
            }

            switch ($result) {
                case 1: $message = 'Пользователь активирован.'; break;
                case 2: $message = 'Пользователь с таким именем уже зарегистрирован.'; break;
                case 3: $message = 'Пользователь с таким e-mail уже зарегистрирован.'; break;
                default: $message = 'Произошла неизвестная ошибка. Попробуйте ещё раз.';
            }

            return getPage($app, $request, 'pages/activation.twig', 'Регистрация', array(
                'message' => $message
            ));
        }

        public function check(\Symfony\Component\HttpFoundation\Request $request, \Silex\Application $app, $appid, $command) {
            if ($appid != 'NJjkNAjkajkAJK') {
                return $app->json(
                    array(
                        'result' => 'error',
                        'code' => 403,
                        'error' => 'Wrong API id'
                    )
                );
            }

            if ($command == 'getuser') {
                $username = $request->get('username');
                $query = 'select * from users where username=:username';
                $result = $app['db']->fetchAll($query, array('username' => $username));
                if (!$result) {
                    return $app->json(
                        array(
                            'result' => 'error',
                            'code' => 404,
                            'error' => 'User not found'
                        )
                    );
                }

                return $app->json(array(
                    'result' => 'success',
                    'user' => array(
                        'username' => $result[0]['username_safe'],
                        'password' => $result[0]['password_plain'],
                        'admin' => ($result[0]['flags'] & 1) == 1 ? 1 : 0,
                        'flags' => $result[0]['flags']
                    )
                ));
            }

            return $app->json(
                array(
                    'result' => 'error',
                    'code' => 500,
                    'error' => 'Wrong command'
                )
            );
        }
    }
}
