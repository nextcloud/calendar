<?php if($_['isPublic'] && $_['rendering']!== 'rendering' && $_['rendering']!== 'schedule' ): ?>
<header><div id="header" class="<?php p((isset($_['folder']) ? 'share-folder' : 'share-file')) ?>">
		<div id="header-left">
			<a href="<?php print_unescaped(link_to('', 'index.php')); ?>"
			   title="" id="nextcloud">
				<div class="logo logo-icon"></div>
				<h1 class="header-appname">
					<?php p($theme->getName()); ?>
				</h1>
			</a>
		</div>

		<div id="header-right" class="header-right">
			<a href="<?php p($_['webcalURL']); ?>" id="download" class="button">
				<span class="icon icon-public"></span>
				<span id="download-text"><?php p($l->t('Subscribe'))?></span>
			</a>
			&nbsp;
			<a href="<?php p($_['downloadURL']); ?>" id="download" class="button">
				<span class="icon icon-download"></span>
				<span id="download-text"><?php p($l->t('Download'))?></span>
			</a>
		</div>
	</div>
</header>
<?php else: ?>
<header>
<div id="header" class="<?php p((isset($_['folder']) ? 'share-folder' : 'share-file')) ?>">

</div>
</header>
<?php endif; ?>

<div id="content-wrapper">
	<?php print_unescaped($this->inc('main')); ?>
</div>

