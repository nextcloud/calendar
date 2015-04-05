# set up php under apache
if [[ $(phpenv version-name) == 'hhvm' ]]; then
    sudo a2enmod rewrite actions fastcgi alias
    sudo cp -f owncloud/apps/news/tests/travis/travis-ci-apache-hhvm.conf /etc/apache2/sites-available/default
    sudo sed -e "s?%TRAVIS_BUILD_DIR%?$(pwd)?g" --in-place /etc/apache2/sites-available/default
    sudo service apache2 restart
    hhvm -m daemon -vServer.Type=fastcgi -vServer.Port=9000 -vServer.FixPathInfo=true
else
    sudo cp ~/.phpenv/versions/$(phpenv version-name)/etc/php-fpm.conf.default ~/.phpenv/versions/$(phpenv version-name)/etc/php-fpm.conf
    sudo a2enmod rewrite actions fastcgi alias
    echo "cgi.fix_pathinfo = 1" >> ~/.phpenv/versions/$(phpenv version-name)/etc/php.ini
    ~/.phpenv/versions/$(phpenv version-name)/sbin/php-fpm
    sudo cp -f owncloud/apps/news/tests/travis/travis-ci-apache.conf /etc/apache2/sites-available/default
    sudo sed -e "s?%TRAVIS_BUILD_DIR%?$(pwd)?g" --in-place /etc/apache2/sites-available/default
    sudo service apache2 restart
fi


