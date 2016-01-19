;(function(angular) {'use strict';


angular.module('app.api',['app.config','app.ui'])
  .factory('api',apiFactory);



apiFactory.$inject=['$rootScope','$http','$resource','$timeout','$q','$log','$location','$routeParams','config','Flash'];
function apiFactory($rootScope, $http, $resource, $timeout, $q, $log, $location, $routeParams, config,Flash) {  
  var _categories=[], promise;

  /**
   * get category object
   */
  function findBySlug(slug){
    var cats=_categories;
    for (var i in cats){
      if(cats[i].slug===slug)return cats[i].name;
    }
    return "Inconnu";
  }

  function info($scope, msg, ms, cb){
    Flash.create('success', msg, 'custom-class');
  }

  


  function error($scope, msg, ms, cb){
    Flash.create('danger', msg);
  }  
  

  function uploadfile($scope, options, callback){
    return false;      
  }

  
  function wrapDomain(clazz, key, defaultClazz){

    clazz.prototype.copy = function(data) {
        angular.extend(this,defaultClazz, data);
    };

    //
    // default behavior on error
    clazz.prototype.onerr=function(data,config){
      this.copy(defaultClazz);
    };

    /**
     * chain a Object resource as the next promise
     */
    clazz.prototype.chain=function(promise){
      var self=this;
      this.$promise=this.$promise.then(function(data){
        if(Array.isArray(data))self.wrapArray(data);else self.wrap(data);
        return promise;
      });
      return this;
    };


    /**
     * chain a Array resource as the next promise
     */
    clazz.prototype.chainAll=function(promise){
     var self=this,
         deferred=$q.defer(),
         lst=[];
         
     this.$promise=lst.$promise=this.$promise.then(function(){
          return promise.then(function(l){
            lst=self.wrapArray(l);
            return lst;
          });
     });
     return lst;
    };

    /**
     * wrap json data to Object instance repository
     */
    clazz.prototype.wrapArray=function(values){
      var list=[];
      values.forEach(function(instance){
        //
        // manage cache on multiple instance
        if(!_all[instance[key]]){
          _all[instance[key]]=new clazz();          
        }
        _all[instance[key]].copy(instance);
        list.push(_all[instance[key]]);
      });
      return list;  
    };
    
   
    clazz.prototype.wrap=function(instance){
      this.copy(instance);
      return this;
    };

    clazz.prototype.delete=function(){
      if(_all[this[key]]) delete _all[this[key]];
    };


    
    /**
     * find data in repository 
     */
    clazz.findAll=function(where, cb){
      if (!where){
        return _.map(_all, function(val,key){return val;});
      }
      var lst=_.where(_all,where);
      if(cb)cb(lst);
      return lst;
    };

    clazz.prototype.findAll=function(where){ 
      return clazz.findAll(where);
    };

    clazz.prototype.find=function(where){ 
      return clazz.find(where);
    };

    clazz.find=function(where,cb){
      if (!where){ 
        return;
      }
      var lst;
      if ((typeof where) === "object"){
        lst=_.findWhere(_all,where);
      }else{
        lst=_all[where];
      }
      if(cb)cb(lst);      
      return lst;
    };
    
    clazz.load=function(elems){
      if (!elems) return _.map(_all, function(val,key){return val;});
      var list=_singleton.wrapArray(elems);
      return list;
    };
    //
    //default singleton for user 
    var     _singleton=new clazz({});
    var     _all={};
    return _singleton;  

  }
  return {
    uploadfile:uploadfile,
    wrapDomain:wrapDomain,
    findBySlug:findBySlug,
    error:error,
    info:info
  };
}




  


})(window.angular);


