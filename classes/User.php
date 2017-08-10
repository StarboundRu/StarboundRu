<?php

namespace Starbound;

class User {
    private $data;
    private $stats;
    public function __construct($data, $stats) {
        if ($data === null) {
            $data = array(
                'user_id' => 0,
                'username' => 'Аноним',
                'flags' => 0
            );
        }
        $this->data = $data;
        $this->stats = $stats;
    }
    public function getId() {
        return $this->data['user_id'];
    }
    public function getUsernameSafe() {
        return $this->data['username_safe'];
    }
    public function getUsername() {
        return $this->data['username'];
    }
    public function getAvatar() {
        if ($this->data['avatar'] !== null) {
            return $this->data['avatar'];
        }
        return 'default';
    }
    public function getLevel() {
        return $this->data['level'];
    }
    public function getExperience() {
        return $this->data['exp'];
    }
    public function getLevelExperience() {
        switch ($this->data['level']) {
            case 0:
            case 1: return 10;
            case 2: return 25;
            case 3: return 50;
            default: return 1000;
        }
    }
    public function getHealth() {
        return 50;
    }
    public function getMaxHealth() {
        switch ($this->data['level']) {
            case 0:
            case 1: return 50;
            case 2: return 75;
            case 3: return 100;
            default: return 1000;
        }
    }
    public function getArmor() {
        if ($this->data['user_id'] == 1) {
            return 3;
        }
        return 0;
    }
    public function getComments() {
        return 0;
    }
    public function getWins() {
        return 0;
    }
    public function getDefeats() {
        return 0;
    }
    public function getAge() {
        return $this->data['age'];
    }
    
    public function getInventory() {
        if ($this->data['user_id'] == 1) {
            return array(
                'vodka' => 'Стакан с водкой',
                'balalaika' => 'Балалайка'
            );
        }
        if ($this->data['user_id'] == 36) {
            return array(
                'stick' => 'Длинная палка',
                'ak47' => 'АК-47'
            );
        }
        if ($this->data['user_id'] % 2 == 0) {
            return array(
                'stick' => 'Длинная палка'
            );
        }
        else {
            return array(
                'stone' => 'Тяжёлый камень'
            );
        }
    }
    
    public function visit() {
        global $app;
        $dt = new \DateTime($this->data['last_visit']);
        $dtd = new \DateTime();
        //echo $dt->format('Y-m-d');exit;
        $update = array(
            'last_visit' => $dtd->format('Y-m-d H:i:s')
        );
        if ($dt->format('Y-m-d') != $dtd->format('Y-m-d')) {
            $this->data['age']++;
            $update['age'] = $this->data['age'];
            
            if ($this->data['age'] == 2) {
                $this->data['exp'] += 3;
                $update['exp'] = $this->data['exp'];
            }
            elseif ($this->data['age'] <= 5) {
                $this->data['exp'] += 2;
                $update['exp'] = $this->data['exp'];
            }
            elseif ($this->data['age'] <= 10) {
                $this->data['exp'] += 1;
                $update['exp'] = $this->data['exp'];
            }
        }
        
        $app['db']->update(
                'users', 
                $update,
                array('user_id' => $this->getId())
        );
    }
    public function getSignature($session) {
        $userId = $this->getId();
        $username = $this->getUsername();
        return md5("$session|$userId|NJK23nNkl2n309");
    }
    public function getFlags() {
        if ($this->data['user_id'] == 1) return 1;
        return 0;
    }
    public function isCanPostNews() {
        return ($this->data['flags'] && 1) == 1;
    }
    public function isAdmin() {
        return ($this->data['flags'] && 1) == 1;
    }
}

?>
