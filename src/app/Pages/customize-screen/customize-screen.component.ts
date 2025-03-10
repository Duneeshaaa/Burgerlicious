import { Component, ElementRef, ViewChild,OnInit } from '@angular/core';
import { CustomizeSessionSeriveService } from 'src/app/Services/customize-session-serive.service';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CustomizeConfirmComponent } from 'src/app/Components/customize-confirm/customize-confirm.component';



@Component({
  selector: 'app-customize-screen',
  templateUrl: './customize-screen.component.html',
  styleUrls: ['./customize-screen.component.scss']
})
export class CustomizeScreenComponent implements OnInit {
  imageHeight: number = 50;
  sessionDataArray: any[] = [];
  totalPrice: number|undefined;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement> | undefined;



  constructor(private customizeSessionService: CustomizeSessionSeriveService, private dialog: MatDialog) { }

  ngOnInit() {
    // Get ingredients from local storage (without reversing the order)
    this.sessionDataArray = this.customizeSessionService.getCustomizeItems();
    console.log(this.sessionDataArray);
    this.totalPrice = this.calculateTotalPrice();
    console.log('hi')
  }

  removeIngredient(index: number) {
    // Update local storage to reflect the changes
    this.customizeSessionService.removeCustomizationFromContainer(index);
    this.totalPrice = this.calculateTotalPrice();
  }

  moveImageUp(index: number) {
    if (index > 0) {
      const temp = this.sessionDataArray[index];
      this.sessionDataArray[index] = this.sessionDataArray[index - 1];
      this.sessionDataArray[index - 1] = temp;
    }
  }
  
  moveImageDown(index: number) {
    if (index < this.sessionDataArray.length - 1) {
      const temp = this.sessionDataArray[index];
      this.sessionDataArray[index] = this.sessionDataArray[index + 1];
      this.sessionDataArray[index + 1] = temp;
    }
  }

  recalculateTotalAmount() {
    // Recalculate the total amount
    this.totalPrice = this.calculateTotalPrice();
  }

  // Create a method to calculate the total price
  calculateTotalPrice(): number {
    let totalPrice = 0;
    for (const item of this.sessionDataArray) {
      const priceAsNumber = parseFloat(item.Ingredient.Price);
  
      if (!isNaN(priceAsNumber)) {
        totalPrice += priceAsNumber;
      }
    }
    return totalPrice;
  }
  
  clearCustomization(){
    console.log(this.sessionDataArray);
    this.sessionDataArray=[];
    console.log(this.sessionDataArray);
  }


  
  captureAndSaveImage(): void {
    const imageContainer = document.querySelector('.imageContainer') as HTMLElement;

  // Find all elements with the "burger-controller" class
  const burgerControllerElements = imageContainer.querySelectorAll('.burger-controller');

  // Hide the burger controller buttons
  burgerControllerElements.forEach((element: Element) => {
    (element as HTMLElement).style.visibility = 'hidden';
  });
  
    // Use HTML2Canvas to capture the contents of .imageContainer with a transparent background
    html2canvas(imageContainer, { 
      scale: 2, 
      backgroundColor: 'transparent' 
    }).then((canvas: HTMLCanvasElement) => {
      canvas.toBlob((blob: Blob | null) => {
        if (blob) {
          //saveAs(blob, 'burgerimg.png');
          const capturedImage = canvas.toDataURL('image/png');
          this.openCaptureDialog(capturedImage);
        } else {
          console.error('Failed to create Blob.');
        }
        
        burgerControllerElements.forEach((element: Element) => {
          (element as HTMLElement).style.visibility = 'visible';
        });
      });
    });
  }
  

  openCaptureDialog(capturedImage: string) {
    const dialogRef = this.dialog.open(CustomizeConfirmComponent, {
      height: window.innerWidth < 968 ? '100vh' : '400px',
      width: '40vw',
      maxWidth: '100vw',
      data: { capturedImage },
    });

    dialogRef.afterClosed().subscribe(() => {
      // Show the button controllers again when the dialog is closed
      const imageContainer = document.querySelector('.imageContainer') as HTMLElement;
      const burgerControllerElements = imageContainer.querySelectorAll('.burger-controller');``
      burgerControllerElements.forEach((element: Element) => {
        (element as HTMLElement).style.visibility = 'visible';
      });
    });
  }
  
}
