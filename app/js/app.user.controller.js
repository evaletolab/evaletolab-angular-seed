;(function(angular) {'use strict';

//
// Define the User module (app.user)  for controllers, services and models
// the app.user module depend on app.config and take resources in account/*.html
var User=angular.module('app.user', ['app.config','app.user.ui','app.user.factory'])
  .config(userConfig)
  .controller('AccountCtrl',AccountCtrl);

//
// user route configuration
userConfig.$inject=['$routeProvider', '$locationProvider', '$httpProvider'];
function userConfig ($routeProvider, $locationProvider, $httpProvider) {
  // List of routes of the application
  $routeProvider
    // Authentication
    .when('/auth', {redirectTo : '/auth/login'})
    .when('/signup', {title:'Créer votre compte', _view:'main', templateUrl : '/partials/account/signup.html'})
    .when('/login', {title:'Login', _view:'main', templateUrl : '/partials/account/login.html'})
    .when('/validate/:id/:email', {title:'Email Validation', templateUrl : '/partials/account/validate.html'})
    .when('/recovery', { _view:'main', templateUrl : '/partials/account/recovery.html'})

    // Account
    // `auth : true` is a custom value passed to current route
    .when('/account', {title:'Votre profil', _view:'main',redirectTo : '/account/overview'})
    .when('/account/', {title:'Votre profil', _view:'main', redirectTo : '/account/overview'})
    .when('/account/love', {_view:'main', love:true, templateUrl : '/partials/product/love.html'})
    .when('/account/overview', {auth : true, _view:'main', templateUrl : '/partials/account/overview.html'})
    .when('/account/password', {auth : true, _view:'main', templateUrl : '/partials/account/password.html'})
    .when('/account/profile', {auth : true, _view:'main', templateUrl : '/partials/account/profile.html'})
    .when('/account/signup', {view:'main', templateUrl : '/partials/account/profile.html'})
    .when('/admin/config', {title:'Configuration ', templateUrl : '/partials/dashboard/dashboard-config.html'})
    .when('/admin/activities', {title:'Configuration ', templateUrl : '/partials/dashboard/dashboard-activity.html'})
    .when('/admin/user', {title:'Admin of users ', templateUrl : '/partials/admin/user.html'});
}


//
// user controller
AccountCtrl.$inject=['config','$scope','$location','$rootScope','$routeParams','api','user','$timeout','$http'];
function AccountCtrl (config, $scope, $location, $rootScope, $routeParams, api, user, $timeout, $http) {
    $scope.user=user;
    $scope.config=config;
    $scope.reg={};
    $scope.users=[];
    $scope.providers=config.providers;

    $scope.pm={
      'american express':'ae.jpg',
      'mastercard':'mc.jpg',
      'visa':'visa.jpg',
      'postfinance card':'pfc.jpg',
      'invoice':'bvr.jpg',
      'wallet':'wallet.jpg'
    };

    // show payment form
    $scope.options={
      showCreditCard:false,
      showPaymentForm:false,
      orderByField:'logged',
      filterByField:false
    };

    // default model for modal view
    $scope.modal = {};

    $scope.applyTableFilter=function (action) {
      var options=$scope.options;
      switch(action){
        case 'logged':
        case 'updated':
        options.orderByField=action;
        options.reverseSort=!options.reverseSort;
        break;
        case 'email':
        options.filterByField=(options.filterByField===1)?
          options.filterByField=false:options.filterByField=1;

      }
      // body...
    };


    // remove an user
    $scope.remove=function(user, password, dismiss){
      $scope.modal = {};
      dismiss();
      user.remove(password,function(){
        api.info($scope,"l'utilisateur est supprimé");
        // remove user from local repository
        for (var i=0;i<$scope.users.length;i++){
          if($scope.users[i].id===user.id)
            $scope.users.splice(i,1);
        }
      });
    };

    $scope.modalUserDetails=function(user){
      $scope.modal=user;
      $scope.invoice_name=user.email.address;
    };

    $scope.modalDissmiss=function(){
      var modal=$scope.modal;
      $scope.modal = {};
      $scope.findAllUsers();
    };


    //
    // list all users
    // get list of users
    $scope.findAllUsers=function(filter){
      filter=filter||{};
      user.query(filter).$promise.then(function(u){
          $scope.users=u;
      });
    };

    //
    // login action
    $scope.login= function(email,password){
      $rootScope.WaitText="Waiting ...";
      user.login({ email: email, password:password, provider:'local' },function(u){
        api.info($scope,"Merci, vous êtes dès maintenant connecté");

        //
        // if referer is in protected path?
        if($scope.referrer&&_.find(config.loginPath,function(path){
            return ($scope.referrer.indexOf(path)!==-1);})){
          return $location.url($scope.referrer);
        }
        if($scope.referrer&&_.find(config.readonlyPath,function(path){
            return ($scope.referrer.indexOf(path)!==-1);})){
          return $location.url($scope.referrer);
        }

        //
        // admin collect food
        if(user.isAdmin()){
          // return $location.url('/admin/collect');
        }

        //
        // user is a shopper 
        if(user.hasRole('logistic')){
          // return $location.url('/admin/shipping');
        }


 
        //
        // else goto '/'
        $location.url('/');
      });
    };

    $scope.validateEmail=function(){
      if($routeParams.id&&$routeParams.email){
        user.validate($routeParams,function(msg){
          api.info($scope,"Votre adresse email à été validée!");
          user.email.status=true;

          //
          // user is a shopper 
          if(user.hasRole('logistic')){
            return $location.url('/admin/shipping');
          }

        });
      }
    };


    //
    // create a new account
    $scope.createAccount=function(u){
      var r={email:u.email.address,firstname:u.name.givenName,lastname:u.name.familyName,
            password:u.password.new,confirm:u.password.copy
      };
      $rootScope.WaitText="Waiting ...";

      user.register(r,function(){
        api.info($scope,"Votre compte à été créé! Une demande de confirmation vous a été envoyée à votre adresse email");

        if($scope.referrer&&_.find(config.readonlyPath,function(path){
            return ($scope.referrer.indexOf(path)!==-1);})){
          return $location.url($scope.referrer);
        }

        $location.url('/');
      });
    };


    //
    // save action
    $scope.save=function(u){
      $rootScope.WaitText="Waiting ...";
      user.save(u,function(){
        api.info($scope,"Profil enregistré");
      });
    };



    //
    // validate user email
    $scope.changePassword=function(email,password){
      $rootScope.WaitText="Waiting ...";
      password.email=email;
      user.newpassword(password,function(){
        api.info($scope,"Password modifié");
        user.password={};
        $location.url('/account/profile');
      });
    };


    //
    // recover user pass
    $scope.recover=function(email){
      $rootScope.WaitText="Waiting ...";
      user.recover({token:'Zz7YkTpPPp5YFQnCprtc7O9',email:email},function(){
        api.info($scope,"Merci, une information a été envoyé à votre adresse email");
          if (!user.isAuthenticated())
            $location.url('/login');
          else
            $location.url('/account/profile');
      });
      return;

    };

    $scope.updateStatus=function(id,status){
      $rootScope.WaitText="Waiting ...";
      user.updateStatus(id,status,function(){
        api.info($scope,"Le status à été modifié");
      });
    };



   


}



})(window.angular);
