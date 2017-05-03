<header><div id="header" class="<?php p((isset($_['folder']) ? 'share-folder' : 'share-file')) ?>">
		<div id="header-left">
			<a href="<?php print_unescaped(link_to('', 'index.php')); ?>"
			   title="" id="nextcloud">
				<div class="logo-icon svg"></div>
				<h1 class="header-appname">
					<?php p($theme->getName()); ?>
				</h1>
			</a>
		</div>

		<div id="logo-claim" style="display:none;"><?php p($theme->getLogoClaim()); ?></div>
		<div id="header-right">
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
<div id="content-wrapper">
	<?php print_unescaped($this->inc('main')); ?>
</div>
