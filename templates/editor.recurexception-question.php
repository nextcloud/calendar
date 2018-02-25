<div>
	<form class="events" ng-submit="">
		<fieldset class="events--fieldset">
			<h2><?php p($l->t('Do you want to change all, this only or this and all future occurrences?')); ?></h2>
		</fieldset>
		<fieldset class="events--fieldset">
			<button ng-click="all()" class="events--button button btn" type="button" tabindex="100">
				<?php p($l->t('All')); ?>
			</button>
			<button ng-click="thisOnly()" class="events--button button btn" type="button" tabindex="101">
				<?php p($l->t('This only')); ?>
			</button>
			<button ng-click="thisAndAllFuture()" class="events--button button btn" type="button" tabindex="102">
				<?php p($l->t('This and all future')); ?>
			</button>
		</fieldset>
	</form>
</div>
