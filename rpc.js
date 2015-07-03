(function($) {
  'use strict';
  
  var _fw = lista,
      _url = '/backend.php',
      _util;
  
  /* Map essential utilies from framework */
  _util = {
    undef : _fw.undef,
    group : _fw.group,
    debug : _fw.debug,
    error : _fw.error
  };
  
  /**
   * Plugin.
   * Instantiate an rpc object, binding call methods.
   * @param key
   * @param methods Array of methods to bind to rpc object.
   * @param debug
   * @return object
   */
  _fw.plugin.rpc = function(key, methods, debug) {
    debug = debug || false;
    if (debug) { _util.group('RPC instantiation', key, methods); }
    
    /* Verify arguments */
    if (_util.undef(key)) {
      _util.error('Missing rpc key.');
      if (debug) { _util.group(); }
      return false;
    } else if (!methods.length) {
      _util.error('Missing rpc methods.');
      if (debug) { _util.group(); }
      return false;
    }
    
    /*
     * Initialize plugin
     ****************************************/
    
    var plugin = this;
    plugin.url = _url;
    plugin.key = key;
    plugin.debug = debug;
    
    /*
     * Define and bind plugin methods
     ****************************************/
    
    $.each(methods, function(i, method) {
      (function(method) {
        if (plugin.debug) { _util.debug('Binding rpc method', method); }
        plugin[method] = function(options) {
          plugin.call(method, options);
        };
      }(method));
    });
    if (debug) { _util.group(); }
  };
  
  /**
   * Bind call method to all rpc instances.
   * Handles method calls and initiates ajax request.
   * @param method
   * @param options
   */
  _fw.plugin.rpc.prototype.call = function(method, options) {
    if (this.debug) { _util.group('Running rpc method', method, options); }
    var plugin = this;
    var options = options || {},
        request = {
          jsonrpc : '2.0',
          method : method,
          id : plugin.key
        };
    if (!_util.undef(options.params)) {
      request.params = options.params;
    }
    if (plugin.debug) { _util.debug('RPC request parameters', request, plugin); }
    
    /* Make ajax call */
    $.ajax({
      url : plugin.url,
      data : JSON.stringify(request),
      type : 'POST',
      contentType : 'application/json',
      dataType : 'json',
      success : function(response) {
        if (plugin.debug) { _util.group('RPC successful, checking server response', response); }
        
        /* Checking for failure */
        if (!_util.undef(response.error) || _util.undef(response.result)) {
          if (plugin.debug) { _util.debug('Response indicated failure'); }
          
          /* Converting response to javascript object */
          try {
            response = _util.undef(response.responseText) ? {} : JSON.parse(response.responseText);
          } catch (e) {
            if (plugin.debug) { _util.debug('Couldn\'t convert response to javascript object'); }
            response = {};
          }

          /* Checking for custom failure function */
          if (!_util.undef(options.failure)) {
            if (plugin.debug) { _util.debug('Calling custom failure function', options.failure); }
            options.failure(response);
          }
          if (plugin.debug) { _util.group(); }
          return;
        }
        
        /* Bind get method for parameters */
        $.extend(response, {
          get : function(index, name) {
            return response.result[1][index][response.result[0][name]];
          }
        });
        
        /* Checking for custom success function */
        if (!_util.undef(options.success)) {
          if (plugin.debug) { _util.debug('Calling custom success function', options.success); }
          options.success(response, response.result[1]);
        }
        if (plugin.debug) { _util.group(); }
        return true;
      },
      error : function(err, status, thrown) {
        if (plugin.debug) { _util.group('RPC unsuccessful, checking server response', err, status, thrown); }
        
        /* Checking for custom error function */
        if (!_util.undef(options.error)) {
          if (plugin.debug) { _util.debug('Calling custom error function', options.error); }
          options.error(err);
        }
        if (plugin.debug) { _util.group(); }
        return true;
      },
      complete : function(response, status) {
        if (plugin.debug) { _util.group('RPC complete', response, status); }
        
        /* Converting response to javascript object */
        try {
          response = _util.undef(response.responseText) ? {} : JSON.parse(response.responseText);
        } catch (e) {
          if (plugin.debug) { _util.debug('Couldn\'t convert response to javascript object'); }
          response = {};
        }
        
        /* Checking for failure */
        if (!_util.undef(response.error) || _util.undef(response.result)) {
          status = 'failed';
          response.error = response.error || {};
          response.error.message = response.error.message || '[rpc.js] Något gick snett';
        } else {
          /* Bind get method for parameters */
          $.extend(response, {
            get : function(index, name) {
              return response.result[1][index][response.result[0][name]];
            }
          });
        }
        
        /* Checking for custom complete function */
        if (!_util.undef(options.complete)) {
          if (plugin.debug) { _util.debug('Calling custom complete function', options.complete); }
          options.complete(response, status);
        }
        if (plugin.debug) { _util.group(); }
        return true;
      }
    });
    if (plugin.debug) { _util.group(); }
  };
  
}(jQuery));
