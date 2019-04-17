import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavController, MenuController, ToastController, AlertController, LoadingController, Platform } from '@ionic/angular';
import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';
import { TwitterConnect } from '@ionic-native/twitter-connect/ngx';
import { GooglePlus } from '@ionic-native/google-plus/ngx';
import { LinkedIn } from '@ionic-native/linkedin/ngx';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  public onLoginForm: FormGroup;

  constructor(
    public navCtrl: NavController,
    public menuCtrl: MenuController,
    public toastCtrl: ToastController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    private formBuilder: FormBuilder,
    private fb: Facebook,
    private tw: TwitterConnect,
    private platform: Platform,
    private googlePlus: GooglePlus,
    private linkedin: LinkedIn
  ) { }

  ionViewWillEnter() {
    this.menuCtrl.enable(false);
  }

  ngOnInit() {

    this.onLoginForm = this.formBuilder.group({
      'email': [null, Validators.compose([
        Validators.required
      ])],
      'password': [null, Validators.compose([
        Validators.required
      ])]
    });
  }

  async forgotPass() {
    const alert = await this.alertCtrl.create({
      header: 'Forgot Password?',
      message: 'Enter you email address to send a reset link password.',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'Email'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Confirm',
          handler: async () => {
            const loader = await this.loadingCtrl.create({
              duration: 2000
            });

            loader.present();
            loader.onWillDismiss().then(async l => {
              const toast = await this.toastCtrl.create({
                showCloseButton: true,
                message: 'Email was sended successfully.',
                duration: 3000,
                position: 'bottom'
              });

              toast.present();
            });
          }
        }
      ]
    });

    await alert.present();
  }

  // // //
  goToRegister() {
    this.navCtrl.navigateRoot('/register');
  }

  goToHome() {
    this.navCtrl.navigateRoot('/home-results');
  }

  facebookLogin() {
    this.fb.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => {
        if (res.status === 'connected') {
          console.log('Logged into Facebook!', res);
        }
      }).catch(e => console.log('Error logging into Facebook', e));
    this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ADDED_TO_CART);
  }

  async doTwLogin() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    this.tw.login()
      .then(res => {
        // Get user data
        // There is a bug which fires the success event in the error event.
        // The issue is reported in https://github.com/chroa/twitter-connect-plugin/issues/23
        this.tw.showUser()
          .then(user => {
            console.log(user);
            loading.dismiss();
          }, err => {
            console.log(err);
            // default twitter image is too small https://developer.twitter.com/en/docs/accounts-and-users/user-profile-images-and-banners
          });
      }, err => {
        loading.dismiss();
      });
  }

  async presentLoading(loading) {
    return await loading.present();
  }

  async doGoogleLogin() {
    const loading = await this.loadingCtrl.create({
      message: 'Please wait...'
    });
    this.presentLoading(loading);
    this.googlePlus.login({
      'scopes': '', // optional - space-separated list of scopes, If not included or empty, defaults to `profile` and `email`.
      'webClientId': 'googleWebClientId',
      'offline': true
    }).then(user => {
      loading.dismiss();
    }, err => {
      console.log(err);
      if (!this.platform.is('cordova')) {
        this.presentAlert();
      }
      loading.dismiss();
    });
  }

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      message: 'Cordova is not available on desktop. Please try this in a real device or in an emulator.',
      buttons: ['OK']
    });

    await alert.present();
  }
  async dolinkedIn() {
    this.linkedin.hasActiveSession().then((active) => console.log('has active session?', active));

    // login
    const scopes = ['r_basicprofile', 'r_emailaddress', 'rw_company_admin', 'w_share'];
    this.linkedin.login(scopes, true)
      .then(() => console.log('Logged in!'))
      .catch(e => console.log('Error logging in', e));


    // get connections
    this.linkedin.getRequest('people/~')
      .then(res => console.log(res))
      .catch(e => console.log(e));

    // share something on profile
    const body = {
      comment: 'Hello world!',
      visibility: {
        code: 'anyone'
      }
    };

    this.linkedin.postRequest('~/shares', body)
      .then(res => console.log(res))
      .catch(e => console.log(e));

  }
}
