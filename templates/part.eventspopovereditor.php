<div>
	<form id="event_form">

		<?php print_unescaped($this->inc('part.eventsinfo')); ?>

		<div class="events-container">
			<fieldset class="event-fieldset pull-left">
				<button ng-click="delete()" class="event-button button btn">
					<?php p($l->t('Delete Event')); ?>
				</button>
			</fieldset>

			<fieldset class="event-fieldset pull-right">
				<button ng-click="proceed()" class="event-button button btn">
					<?php p($l->t('Advanced options')); ?>
				</button>
				<button
					class="event-button button btn primary"
					ng-click="save()"
					ng-show="is_new">
					<?php p($l->t('Create')); ?>
				</button>
				<button
					class="event-button button btn primary"
					ng-click="save()"
					ng-show="!is_new">
					<?php p($l->t('Update')); ?>
				</button>
			</fieldset>
		</div>
	</form>
</div>