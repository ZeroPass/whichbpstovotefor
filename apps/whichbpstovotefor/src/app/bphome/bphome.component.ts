import { Component } from '@angular/core'
import { Router } from '@angular/router';
import { ScatterService } from '../shared/scatter.service'


@Component({
  selector: 'app-bphome',
  templateUrl: './bphome.component.html',
  styleUrls: ['./bphome.component.scss']
})
export class BPHomeComponent {

  loginError: boolean;
  isLoading: boolean;

  constructor(private router: Router, private scatterService: ScatterService) {
    this.loginError = false;
    this.isLoading = false;
  }

  ngOnInit() {
    
  }

  goToHome() {
    this.router.navigateByUrl('/');
  }

  login() {
    this.loginError = false;
    this.isLoading = true;
    this.scatterService.login()
      .subscribe(
        success => {
          this.isLoading = false;
          this.router.navigate(['questions']);
        },
        error => {
          this.loginError = true;
          this.isLoading = false;
        }
      )
  }

}
