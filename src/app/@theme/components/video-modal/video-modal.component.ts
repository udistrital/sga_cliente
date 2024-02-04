import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
})
export class VideoModalComponent {
  videoIframe: SafeHtml;

  constructor(
    public dialogRef: MatDialogRef<VideoModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private sanitizer: DomSanitizer
  ) {
    this.videoIframe = this.generateVideoIframe(data.videoId);
  }

  closeModal(): void {
    this.dialogRef.close();
  }

  generateVideoIframe(videoId: string): SafeHtml {
    const videoUrls = {
      // videos de los 6 tags 
      video1: 'https://www.youtube.com/embed/XeFDNIhtwik?si=xSziyj37QP4ms7vp', // Video Formacion academica
      video2: 'https://www.youtube.com/embed/ppqXk-4CLmo?si=96e84nwPWGsIEiiK', // Video Idiomas
      video3: 'https://www.youtube.com/embed/uSB63rli3UY?si=WGUNbn5VYF-8pfb-', // Video Experiencia laboral
      video4: 'https://www.youtube.com/embed/nU5J8Uyrk2Y?si=y15W6-kK0qouBkKX', // Video Produccion academica
      video5: 'https://www.youtube.com/embed/wWtzFz18kB8?si=s9PHQfkdYT4SPdKo', // Video Documentos solicitados
      video6: 'https://www.youtube.com/embed/pdruTNBXGUc?si=TeOrP5QnE9FL6uGD', // Video Descuento de matricula

      // video Menú inscripción y submenú preinscripción a proyectos curriculares  
      video7: 'https://www.youtube.com/embed/KImgqUr1uwY?si=pUp8wVgaFFEOdNRL', // informacion personal - preinscripcion a proyectos curriculares - vista de todos los tags

      // video bienvenida al sistema 
      video8: 'https://www.youtube.com/embed/Z1t6-GtJ4jw?si=EWrIoWHu0S2EnV8v',  
    };

    const videoUrl = videoUrls[videoId] || 'Video no encontrado';

    if (videoUrl === 'Video no encontrado') {
      return videoUrl;
    }
    const iframeCode = `<iframe width="560" height="315" src="${videoUrl}" title="YouTube video player"
      frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen></iframe>`;

    return this.sanitizer.bypassSecurityTrustHtml(iframeCode);
  }
}