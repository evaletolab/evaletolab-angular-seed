;(function(angular) {'use strict';

//
// Define the application global configuration
angular.module('app.config', [])
  .factory('config', appConfig)
  .controller('ConfigCtrl',ConfigCtrl);


//
// implement service
appConfig.$inject=['$q','$http','$sce','API_SERVER','$translate']; 
function appConfig($q, $http, $sce, API_SERVER, $translate) {
  var deferred = $q.defer();
  
  var defaultConfig = {
    API_SERVER:API_SERVER,
    
    API_VERSION: '/v1',

    LOG_LEVEL: 'debug',
    
    AUTH_SUCCESS_REDIRECT_URL:'/',
    AUTH_ERROR_REDIRECT_URL:'/login',

    filepicker:"At5GnUxymT4WKHOWpTg5iz",
    // storage:"//karibou-filepicker.s3-website-eu-west-1.amazonaws.com/",
    storage:"//s3-eu-west-1.amazonaws.com/karibou-filepicker/",

    uploadcare:'b51a13e6bd44bf76e263',

    staticMapKey:"AIzaSyD5w46BmWX6hX-uJ2yMycS_cRb2HRvDXQU",

    disqus:'7e23b8cfd1ba48cdb5a3487efcbcdc56', /*karibou dev*/ 
    // disqus:'a0602093a94647cd948e95fadb9b9e38', /*karibou prod*/

    cover:'',
    // cover:'img/home-site.jpg',
    
    postfinance:{
      url:$sce.trustAsResourceUrl('https://e-payment.postfinance.ch/ncol/test/orderstandard_utf8.asp')
    },

    user:{
      photo:'//placehold.it/80x80'
    },
    shop:{
      photo:{
        fg:"//placehold.it/400x300",
        owner:"//placehold.it/80x80&text=owner",
        bg:''
      }
    },
    loginPath:['/admin','/account'],
    avoidShopUIIn:['/admin','/login','/signup','/page']
  };

  defaultConfig.providers = [
    {name: 'twitter',   url: defaultConfig.API_SERVER + '/auth/twitter'},
    {name: 'google+',   url: defaultConfig.API_SERVER + '/auth/google'},
    {name: 'persona',   url: defaultConfig.API_SERVER + '/auth/browserid'},
  ];

  defaultConfig.otherproviders = [
    {name: 'google+',   url: defaultConfig.API_SERVER + '/auth/google'},
    {name: 'facebook',  url: defaultConfig.API_SERVER + '/auth/facebook'},
    {name: 'linkedin',  url: defaultConfig.API_SERVER + '/auth/linkedin'},
    {name: 'github',    url: defaultConfig.API_SERVER + '/auth/github'}
  ];

  
  //
  // get server side config

  defaultConfig.shared=deferred.promise;
  $http.get(defaultConfig.API_SERVER+'/v1/config?lang='+$translate.use()).then(function(response){
      angular.extend(defaultConfig.shared,response.data);
      deferred.resolve(defaultConfig);
  });

  return defaultConfig;
}


//
// implement config controller
ConfigCtrl.$inject=['$rootScope','$resource','config','api','Flash'];
function ConfigCtrl($scope,$resource,config,api,Flash){
  var $dao=$resource(config.API_SERVER+'/v1/config');

  $scope.menuSplice=function (lst, menu) {
    for (var i = lst.length - 1; i >= 0; i--) {
      if(lst[i].name===menu.name){
        lst.splice(i, 1);
      }
    }
  };

  //
  // save stored config (admin only)
  $scope.saveConfig=function(){
    $dao.save(config.shared,function(){
      Flash.create('success', "Configuration sauvée");

      // api.info($scope,"Configuration sauvée");
    });
  };

}

})(window.angular);
