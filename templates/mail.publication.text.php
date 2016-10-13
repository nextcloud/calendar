<?php p($l->t('Hello,')); ?>
<?php p('\n\n'); ?>

<?php $l->t("We wanted to inform you that %s has published the calendar %s.", [$_['username'],$_['calendarname']]); ?>
<?php p('\n'); ?>

<?php p($l->t('Click on the link below to access it !')); ?>
<?php p('\n'); ?>

<?php p($_['calendarurl']); ?>
<?php p('\n\n'); ?>

<?php p($l->t('Cheers!')); ?>
