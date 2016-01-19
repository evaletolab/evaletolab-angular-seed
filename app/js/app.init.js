;(function(angular) {'use strict';

// 
// chromium-browser --ignore-gpu-blacklist --disable-gpu-sandbox
// var API_SERVER='http://localhost:4000';
var API_SERVER='//api.'+window.location.hostname;
// var API_SERVER='http://192.168.1.35:4000'
// var API_SERVER='http://karibou-api.cloudfoundry.com'
// var API_SERVER='http://karibou-evaletolab.rhcloud.com'
// var API_SERVER='http://karibou-api.jit.su'
// var API_SERVER='http://karibou-api.eu01.aws.af.cm'

// Declare application level module which depends on additional filters and services (most of them are custom)
angular.module('app', [
  'ngCookies',
  'ngResource',
  'ngRoute',
  'ngSanitize',
  'ngTouch',
  'ngAnimate',
  'pascalprecht.translate',
  'infinite-scroll',
  'flash',
  'angular.filter',
  'ngUploadcare',
  'app.templates',
  'app.config',
  'app.storage',
  'app.raven',
  'app.api',
  'app.root',
  'app.user',
  'app.document',
  'app.feedback'
])
  .value('API_SERVER',API_SERVER)
  .config(appConfig)
  .factory('errorInterceptor', errorInterceptor)
  .run(appRun);




//
// FIX (iOS 8 GM iPhone5C) TypeError: Attempted to assign to readonly property
// https://github.com/angular/angular.js/issues/9128#issuecomment-88921426
// https://gist.github.com/harrastia/4a963e62605f73bbfff2
function rootScopeFIX($provide) {
 
  // Minification-safe hack.
  var $$watchers = '$$watchers',
      $$nextSibling = '$$nextSibling',
      $$childHead = '$$childHead',
      $$childTail = '$$childTail',
      $$listeners = '$$listeners',
      $$listenerCount = '$$listenerCount',
      $$ChildScope = '$$childScope',
      $id = '$id',
      $parent = '$parent',
      $$prevSibling = '$$prevSibling',
      $root = '$root';
 
  $provide.decorator('$rootScope', ['$delegate', function($rootScope) {
    var proto = Object.getPrototypeOf($rootScope);
 
    function nextUid () {
      return ++$rootScope.$id;
    }
 
    proto.$new = function(isolate, parent) {
      var child;
 
      function destroyChild() {
        child.$$destroyed = true;
      }
 
      parent = parent || this;
 
      if (isolate) {
        child = new proto.constructor();
        child[$root] = this.$root;
      } else {
        // Only create a child scope class if somebody asks for one,
        // but cache it to allow the VM to optimize lookups.
        if (!this.$$ChildScope) {
          this[$$ChildScope] = function ChildScope() {
            this[$$watchers] = this[$$nextSibling] =
                this[$$childHead] = this[$$childTail] = null;
            this[$$listeners] = {};
            this[$$listenerCount] = {};
            this[$id] = nextUid();
            this[$$ChildScope] = null;
          };
          this[$$ChildScope].prototype = this;
        }
        child = new this[$$ChildScope]();
      }
 
      child[$parent] = parent;
      child[$$prevSibling] = parent.$$childTail;
      if (parent.$$childHead) {
        parent[$$childTail][$$nextSibling] = child;
        parent[$$childTail] = child;
      } else {
        parent[$$childHead] = parent[$$childTail] = child;
      }
 
      // When the new scope is not isolated or we inherit from `this`, and
      // the parent scope is destroyed, the property `$$destroyed` is inherited
      // prototypically. In all other cases, this property needs to be set
      // when the parent scope is destroyed.
      // The listener needs to be added after the parent is set
      if (isolate || parent != this) child.$on('$destroy', destroyChild);
 
      return child;
    };
    $rootScope.$new = proto.$new;
    return $rootScope;
  }]);
}
//
// Scroll events can be triggered very frequently, which can hurt performance and make scrolling appear jerky.
//angular.module('infinite-scroll').value('THROTTLE_MILLISECONDS', 500)

//
// Configure application $route, $location and $http services.
appConfig.$inject=['$provide','$routeProvider','$locationProvider','$httpProvider','$translateProvider'];
function appConfig( $provide, $routeProvider, $locationProvider, $httpProvider,$translateProvider) {
  
  // FIX IOS error
  rootScopeFIX($provide);

  $httpProvider.interceptors.push('errorInterceptor');

  //console.log("$httpProvider.defaults",$httpProvider.defaults);
  $httpProvider.defaults.crossDomain=true;
  $httpProvider.defaults.withCredentials=true;

  //
  // clear the cache
  //$httpProvider.defaults.headers.common['Cache-Control']='no-cache';
  //$templateCache.removeAll()

  // List of routes of the application
  $routeProvider
    // Pages
    .when('/',{templateUrl:'/partials/pages/welcome.html'})
    .when('/welcome',{templateUrl:'/partials/pages/welcome.html'})
    .when('/the-site-is-currently-down-for-maintenance-reasons', {title:'the site is currently down for maintenance reasons',templateUrl : '/partials/errors/down.html'})
    // 404
    .when('/404', {title:'404',templateUrl : '/partials/errors/404.html'})
    // Catch all
    .otherwise({redirectTo : '/404'});


  // i18n

  $translateProvider.translations('en', {
    sitemessage:'Home page message',
    siteabout:'About the site',
    sitetitle:'Site tagline',
    sitename:'Site name',
    hello: 'Hello',
    logout: 'Logout',
    login: 'Login',
    signup: 'Signup',
    general: 'General',
    navigation: 'Navigation',
    users:'Users',
    activity:'Activity',
    config:'Settings',
    publication:'Publications',
    allpubli:'My publications',
    security:"Security",
    password:"Change password",
    profile:"Update profile",
    furthermore:"Furthermore",
    formlogintitle:'Have an account ?',
    formlogincreate:'Or create an account?'
  });
  $translateProvider.translations('fr', {
    sitemessage:'Message sur la home du site',
    siteabout:'A propos du site',
    sitetitle:'Titre du site',
    sitename:'Nom du site',
    hello:'Bonjour',
    logout: 'Logout',
    login: 'Connexion',
    signup: 'S\'inscrire',
    general: 'Général',
    navigation: 'Navigation',
    users:'Utilisateur',
    activity:'Activité',
    config:'Configuration',    
    publication:'Publications',
    allpubli:"Mes publications",
    security:"Sécurité",
    password:"Modifier mon mot de passe",
    profile:"Mes données personnelles",
    furthermore:"A lire aussi",
    formlogintitle:'Vous avez déjà un compte ?',
    formlogincreate:'Ou créer un compte?'
  });

  $translateProvider.preferredLanguage('fr');
  $translateProvider.useStorage('$storage');
  $translateProvider.useSanitizeValueStrategy(null);
  // Without serve side support html5 must be disabled.
  $locationProvider.html5Mode(true);
  // $locationProvider.hashPrefix('!');
}


// define default behavior for all http request
// http://www.webdeveasy.com/interceptors-in-angularjs-and-useful-examples/
errorInterceptor.$inject = ['$q', '$rootScope', '$location', '$timeout','Flash'];
function errorInterceptor($q, scope, $location, $timeout, Flash) {
  var error_net=0;
  function parseError(err){
      if(typeof err === 'string') {return err;}
      if(typeof err.responseText === 'string'){return err.responseText;}
      if(typeof err.data === 'string'){return err.data;}       
      if(typeof err.message === 'string'){return err.message;}       
      if(err.data&&err.data.length){
        var msg="";
        err.data.forEach(function(e){
          msg=msg+"<p>"+e+"</p>";
        });
        return msg;
      }         
      return "Undefined error! ->"+JSON.stringify(err);
  }

  function showError($scope, err, ms){
    // $scope.FormErrors=parseError(err);
    // $timeout(function(){
    //   $scope.FormErrors=undefined;
    // }, ms||5000);
    Flash.create('danger', err);
  }

  return {
      request: function (config) {
          scope.WaitText = 'Working...';
          return config || $q.when(config);
      },
      requestError: function (request) {
          return $q.reject(request);
      },
      response: function (response) {
          scope.WaitText = false;error_net=0;
          return response || $q.when(response);
      },
      responseError: function (response) {
          scope.WaitText = false;
          // no api
          if (response.status === 0) {
              error_net++;
          }


          if (error_net > 1) {
            $location.path('/the-site-is-currently-down-for-maintenance-reasons');
          }

          // server/api error
          //
          // on error analytics log 
          if(window.ga && response.data && [0,401].indexOf(response.status)==-1 ){
            window.ga('send', 'event', 'error', response.data);
          }

          //
          // if we are anonymous in the wrong place ...
          if(401===response.status){
            var longpath=$location.path();
            // user state is updated async after this call, so the current state is wrong!
            // if(!scope.user.isAuthenticated() && _.find(['/account','/admin','/order/'],function(path){
            if(_.find(['/account','/admin','/order/'],function(path){
              return (longpath.indexOf(path)!==-1);
            })){
              $location.path('/login');
            }else if (response.data.toLowerCase().indexOf('vous devez ouvrir')){
              // if logged but without correct right 
              showError(scope,response.data);            
            }else if(response.config.url.indexOf('/v1/users/me')===-1){
              showError(scope,"Access denied!");
            }
          }

          else if(response.status>0){
            showError(scope,response.data);
          }

          return $q.reject(response);
      }
  };
}


//
// init the module
appRun.$inject=['$templateCache', '$route', '$http','$timeout', 'config'];
function appRun($templateCache, $route, $http, $timeout, config) {

  // special setup that depends on config 
  config.shared.then(function () {
      // Application is ready there
      // init uploadcare key here
      // config.uploadcare=config.shared.keys.pubUpcare;
      uploadcare.start({ publicKey: config.shared.keys.pubUpcare, maxSize:203600});  
      angular.element('html').removeClass('app-loading');
  });


}


// Bootstrap (= launch) application
angular.element(document).ready(function () {

  //
  // loading fastclick for mobile tap
  FastClick.attach(document.body);


  //console.log(window.Showdown.extensions)
  angular.bootstrap(document, ['app']);
});

})(window.angular);
