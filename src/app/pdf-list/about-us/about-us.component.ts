import { Component } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { AuthService } from '../../auth.service';
import { PdfCategoriesService } from '../../pdf-categories.service';
import { PdfService } from '../../pdf.service';
import { PdfListComponent } from '../pdf-list/pdf-list.component';

@Component({
  selector: 'app-about-us',
  templateUrl: '../pdf-list/pdf-list.component.html',
  styleUrls: ['../pdf-list/pdf-list.component.scss'],
})
export class AboutUsComponent extends PdfListComponent {
  constructor(
    pdfSrv: PdfService,
    modalCtrl: ModalController,
    alertCtrl: AlertController,
    authSrv: AuthService,
    categoriesSrv: PdfCategoriesService
  ) {
    super(pdfSrv, modalCtrl, alertCtrl, authSrv, categoriesSrv);

    this.title = 'About Us';
    this.topic = 2;
  }
}
