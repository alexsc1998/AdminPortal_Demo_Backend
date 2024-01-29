export function activationEmailTemplate({
  link,
  name,
  qrData,
  expireDate,
}: {
  link: string;
  name: string;
  qrData: string;
  expireDate: string;
}) {
  return `
  <!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="utf-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" />
	<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/admin-lte@3.2.0/dist/css/adminlte.min.css">
</head>

<body>
	<div class="wrapper">
		<div class="main">
			
			<main class="content">
				<div class="container-fluid p-0 w-100">
					<!-- <h1 class="h3 mb-3">Blank Page</h1> -->
					
						<div class="container d-flex flex-column text-center">
							<div class="row vh-100">
								<div class="col-sm-8 col-md-6 col-lg-6 mx-auto d-table h-100">
									<div class="d-table-cell align-top" style="padding-left: 20px;padding-right: 20px;">
										<!-- <img src="../../src/img/BR Logo Black Tagline.png" width="300" height="80"> -->
										<div class="row">&nbsp;</div>
										<div class="row">
											<h5 class="mb-3">Digital Onboarding</h5>
										</div>
										<div class="row">
											<p class="col-form-label-sm text-secondary"><strong>*** This is an automatically generated email, please do not reply ***</strong></p>
										</div>
										<div class="row">&nbsp;</div>
										<div class="card clearfix row text-center col-form-label-sm text-start">
											<p class="text-start">Hi ${name},</p>
											<p class="text-start">
												To register for <span class="text-info">Affin Bank Account</span>
											</p>
											<p class="text-start">Scan below QR Code or click on the <a href="${link}">link</a>.</p>
											<p class="text-start"><img src="cid:qrCodeImage" width="150" height="150"></p>
											<p class="text-start">The link will expire by ${expireDate}</p>
											<p class="text-start">
												If this is a mistake just ignore this email.
											</p>
										</div>
									</div>
								</div>
							</div>
						</div>
				</div>
			</main>
		</div>
	</div>
</body>
</html>

  `;
}
