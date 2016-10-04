<!doctype html>
<html>
<head>
	<meta name="viewport" content="width=device-width" />
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<title><?php p($_['subject']); ?></title>
	<style>
		/* -------------------------------------
			GLOBAL RESETS
		------------------------------------- */
		img {
			border: none;
			-ms-interpolation-mode: bicubic;
			max-width: 100%; }

		body {
			background-color: #f6f6f6;
			font-family: sans-serif;
			-webkit-font-smoothing: antialiased;
			font-size: 14px;
			line-height: 1.4;
			margin: 0;
			padding: 0;
			-ms-text-size-adjust: 100%;
			-webkit-text-size-adjust: 100%; }

		table {
			border-collapse: separate;
			mso-table-lspace: 0pt;
			mso-table-rspace: 0pt;
			width: 100%; }
		table td {
			font-family: sans-serif;
			font-size: 14px;
			vertical-align: top; }

		/* -------------------------------------
			BODY & CONTAINER
		------------------------------------- */

		.body {
			background-color: #f6f6f6;
			width: 100%; }

		/* Set a max-width, and make it display as block so it will automatically stretch to that width, but will also shrink down on a phone or something */
		.container {
			display: block;
			Margin: 0 auto !important;
			/* makes it centered */
			max-width: 580px;
			padding: 10px;
			width: auto !important;
			width: 580px; }

		/* This should also be a block element, so that it will fill 100% of the .container */
		.content {
			box-sizing: border-box;
			display: block;
			Margin: 0 auto;
			max-width: 580px;
			padding: 10px; }

		/* -------------------------------------
			HEADER, FOOTER, MAIN
		------------------------------------- */
		.main {
			background: #fff;
			border-radius: 3px;
			width: 100%; }

		.wrapper {
			box-sizing: border-box;
			padding: 20px; }

		.footer {
			clear: both;
			padding-top: 10px;
			text-align: center;
			width: 100%; }
		.footer td,
		.footer p,
		.footer span,
		.footer a {
			color: #999999;
			font-size: 12px;
			text-align: center; }

		/* -------------------------------------
			TYPOGRAPHY
		------------------------------------- */
		h1,
		h2,
		h3,
		h4 {
			color: #000000;
			font-family: sans-serif;
			font-weight: 400;
			line-height: 1.4;
			margin: 0;
			Margin-bottom: 30px; }

		h1 {
			font-size: 35px;
			font-weight: 300;
			text-align: center;
			text-transform: capitalize; }

		p,
		ul,
		ol {
			font-family: sans-serif;
			font-size: 14px;
			font-weight: normal;
			margin: 0;
			Margin-bottom: 15px; }
		p li,
		ul li,
		ol li {
			list-style-position: inside;
			margin-left: 5px; }

		a {
			color: #3498db;
			text-decoration: underline; }

		/* -------------------------------------
			BUTTONS
		------------------------------------- */
		.btn {
			box-sizing: border-box;
			width: 100%; }
		.btn > tbody > tr > td {
			padding-bottom: 15px; }
		.btn table {
			width: auto; }
		.btn table td {
			background-color: #ffffff;
			border-radius: 5px;
			text-align: center; }
		.btn a {
			background-color: #ffffff;
			border: solid 1px #3498db;
			border-radius: 5px;
			box-sizing: border-box;
			color: #3498db;
			cursor: pointer;
			display: inline-block;
			font-size: 14px;
			font-weight: bold;
			margin: 0;
			padding: 12px 25px;
			text-decoration: none;
			text-transform: capitalize; }

		.btn-primary table td {
			background-color: #3498db; }

		.btn-primary a {
			background-color: #3498db;
			border-color: #3498db;
			color: #ffffff; }

		.preheader {
			color: transparent;
			display: none;
			height: 0;
			max-height: 0;
			max-width: 0;
			opacity: 0;
			overflow: hidden;
			mso-hide: all;
			visibility: hidden;
			width: 0; }

		.powered-by a {
			text-decoration: none; }

		hr {
			border: 0;
			border-bottom: 1px solid #f6f6f6;
			Margin: 20px 0; }

		/* -------------------------------------
			RESPONSIVE AND MOBILE FRIENDLY STYLES
		------------------------------------- */
		@media only screen and (max-width: 620px) {
			table[class=body] h1 {
				font-size: 28px !important;
				margin-bottom: 10px !important; }
			table[class=body] p,
			table[class=body] ul,
			table[class=body] ol,
			table[class=body] td,
			table[class=body] span,
			table[class=body] a {
				font-size: 16px !important; }
			table[class=body] .wrapper,
			table[class=body] .article {
				padding: 10px !important; }
			table[class=body] .content {
				padding: 0 !important; }
			table[class=body] .container {
				padding: 0 !important;
				width: 100% !important; }
			table[class=body] .main {
				border-left-width: 0 !important;
				border-radius: 0 !important;
				border-right-width: 0 !important; }
			table[class=body] .btn table {
				width: 100% !important; }
			table[class=body] .btn a {
				width: 100% !important; }
			table[class=body] .img-responsive {
				height: auto !important;
				max-width: 100% !important;
				width: auto !important; }}

		/* -------------------------------------
			PRESERVE THESE STYLES IN THE HEAD
		------------------------------------- */
		@media all {
			.ExternalClass {
				width: 100%; }
			.ExternalClass,
			.ExternalClass p,
			.ExternalClass span,
			.ExternalClass font,
			.ExternalClass td,
			.ExternalClass div {
				line-height: 100%; }
			.btn-primary table td:hover {
				background-color: #34495e !important; }
			.btn-primary a:hover {
				background-color: #34495e !important;
				border-color: #34495e !important; } }

		/* Fixes for NextCloud */
		#nojavascript {
			display: none !important;
		}

	</style>
</head>
<body class="">
<table border="0" cellpadding="0" cellspacing="0" class="body">
	<tr>
		<td>&nbsp;</td>
		<td class="container">
			<div class="content">

				<!-- START CENTERED WHITE CONTAINER -->
				<span class="preheader"><?php p($l->t('%s has published the calendar %s', [$_['username'], $_['calendarname']])); ?></span>
				<table class="main">

					<!-- START MAIN CONTENT AREA -->
					<tr>
						<td class="wrapper">
							<table border="0" cellpadding="0" cellspacing="0">
								<tr>
									<td>
										<p><?php p($l->t('Hello,')); ?></p>
										<p><?php
											print_unescaped(str_replace(
												['{boldstart}', '{boldend}'],
												['<b>', '</b>'],
												$l->t("We wanted to inform you that %s has publicly shared the calendar {boldstart}%s{boldend}.", [$_['username'], '<b>' . $_['calendarname'] . '</b>'])
											)); ?></p>
										<table border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
											<tbody>
											<tr>
												<td align="left">
													<table border="0" cellpadding="0" cellspacing="0">
														<tbody>
														<tr>
															<td> <a href="<?php p($_['calendarurl']); ?>" target="_blank"><?php p($l->t('Click here to access it !')); ?></a> </td>
														</tr>
														</tbody>
													</table>
												</td>
											</tr>
											</tbody>
										</table>
										<p>
											<?php
												// TRANSLATORS term at the end of a mail
												p($l->t('Cheers!'));
											?>
										</p>
									</td>
								</tr>
							</table>
						</td>
					</tr>

					<!-- END MAIN CONTENT AREA -->
				</table>

				<!-- START FOOTER -->
				<div class="footer">
					<table border="0" cellpadding="0" cellspacing="0">
						<tr>
							<td class="content-block">
								--<br>
								<?php p($_['defaults']->getName()); ?> -
								<?php p($_['defaults']->getSlogan()); ?>
								<br><a href="<?php p($_['defaults']->getBaseUrl()); ?>"><?php p($_['defaults']->getBaseUrl());?></a>
							</td>
						</tr>
					</table>
				</div>

				<!-- END FOOTER -->

				<!-- END CENTERED WHITE CONTAINER --></div>
		</td>
		<td>&nbsp;</td>
	</tr>
</table>
</body>
</html>