;(function(angular) {'use strict';


//
// Define the application level controllers
angular.module('app.root', ['app.config','app.user'])
  .controller('AppCtrl',appCtrl);

//
// the AppCtrl is used in index.html (see app/assets/index.html)
appCtrl.$inject=[
  '$scope','$rootScope','$window','$location','$routeParams','$timeout','$http','config','api','user'];
function appCtrl($scope, $rootScope, $window,  $location, $routeParams, $timeout, $http, config, api, user) {

  $rootScope.user=$scope.user = user;
  $scope.config=config;
  $scope.api=api;
  $scope.browserName;
  window.referrers=[];


  $scope.options={
    needReload:false
  };


  //
  // welcome page
  // (function() {
  //   var path=$location.path();
  //   if(path.indexOf('/validate/')===0 ||path.indexOf('/page/')===0 ||$cookies.welcome) {      
  //     return;
  //   }

  //   $location.path('/welcome')
  // })()


  //
  // check and init the session    
  user.me(function(u){
    $scope.user = u;
  });


  //
  // after N days without reloading the page, 
  $timeout(function () {
    $scope.options.needReload=true;
  },86400000*2);
  


  //
  // clear cache
  $rootScope.$on('$viewContentLoaded', function() {
    if($window.ga && config.API_SERVER.indexOf('localhost')==-1 && config.API_SERVER.indexOf('evaletolab')==-1){
      if(!user||(user && !user.isAdmin()))
      {$window.ga('send', 'pageview', { page: $location.path() });}        
    }
  });

  //
  // get the head title up2date 
  $rootScope.$on('$routeChangeStart', function (event, current, previous) {
    var longpath=$location.path();
    user.$promise.finally(function(){
      if (!user.isAuthenticated()){
        if(_.find(config.loginPath,function(path){
          return (longpath.indexOf(path)!==-1);
        })){
          $location.path('/login');
        }
      }

      var title="Hello --- :)";
      $rootScope.title = (current.$$route.title)?current.$$route.title:title;

    });
  });


  $scope.subscribe=function (user, subject) {
    var content={
      fname:user.name.givenName,
      lname:user.name.familyName,
      email:user.email.address
    };
    if(!subject){
      return api.info($scope,"Hoho, vous devez préciser votre code postal ;)");        
    }

    // TODO FIX ISSUE WITH NG AND COOKIES
    //$cookies[subject]=true;

    $http.post(config.API_SERVER+'/v1/message/aHR0cDovL2thcmlib3UuZXZhbGV0b2xhYi5jaA==/'+subject, content).
      success(function(data, status, headers, config) {
        api.info($scope,"Votre requête a bien été envoyée! ");        
        user.mailchimp=true;
      });
    
  };


  //
  // browser detection    
  $scope.browser=function() {
    if($scope.browserName){
      return $scope.browserName;
    }
    var userAgent = $window.navigator.userAgent;
    var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};
    for(var key in browsers) {
      if (browsers[key].test(userAgent)) {
        return $scope.browserName=key;
      }
    }
    // special case for IE>=11
    if((new RegExp("Trident/.*rv:([0-9]{1,}[\.0-9]{0,})").exec(navigator.userAgent))&&(navigator.appName == 'Netscape')){
      return 'ie';
    }
  };




  $rootScope.locationReferrer=function(defaultUrl){
    $location.path($rootScope.referrer?$rootScope.referrer:defaultUrl);
  };




  $scope.toggle = function (params,clear) {
    if(clear){
      $location.search({});
    }
    angular.forEach(params, function (v, k) {
        var t = ($location.search()[k] && $location.search()[k] === v) ? null : v;
        $location.search(k, t);
    });
  };


  $scope.getToggleClass=function(key,value, clazz){
    if(!clazz){clazz='active';}
    // for '/'
    if(!key) {
      return (Object.keys($routeParams).length===0)?clazz:'';
    }

    // search options
    return ($routeParams[key]==value)?clazz:'';
  };

  // getClass compares the current url with the id.
  // If the current url starts with the id it returns 'active'
  // otherwise it will return '' an empty string. E.g.
  //
  //  // current url is '/products/1'
  //  getClass('/products'); // returns 'active'
  $scope.getClass = function (id, or) {
    if (!$scope.activeNavId){return '';}
    if ($scope.activeNavId.substring(0, id.length) === id) {
      return 'active';
    }
    if (or && $scope.activeNavId.substring(0, or.length) === or) {
      return 'active';
    }
    return '';
  };
 


  //
  // logout (global function)
  $scope.logout=function(){
    user.logout(function(user){
      $location.url('/');
    });
  };

  //
  // validate user email
  $scope.verify=function(user){
    $rootScope.WaitText="Waiting ...";
    user.validateEmail(function(validate){
      api.info($scope,"Merci, une confirmation a été envoyée à votre adresse email");
      if (!user.isAuthenticated())
        {$location.url('/');}
    });
  };
  
  
  $scope.uploadImageError=function(error){
      //http://ucarecdn.com/c1fab648-f6b7-4623-8070-798165df5ca6/-/resize/300x/
      if(error){
        return api.info($scope,error);
      }

  };

}

})(window.angular);