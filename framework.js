/* jQuery extensions */

jQuery.extend({
  keyCount : function(o) {
    if (typeof o === 'object') {
      var i, count = 0;
      for (i in o) {
        if (o.hasOwnProperty(i)) {
          count++;
        }
      }
      return count;
    } else {
      return 0;
    }
  }
});

/* Framework */

var lista = {};
(function($) {
  'use strict';
  
  $('html').addClass('js');
  
  var self = lista;
  self.settings = typeof _framework_settings !== 'undefined' ? _framework_settings : {};
  
  // Plugin repository
  self.plugin = {};
  
  // Create an internal uri
  self.l = function(uri) {
    var uri = uri || '';
//    return '/' + self.settings.language.langcode + '/' + self.ltrim(uri, '/');
    return '/' + self.ltrim(uri, '/');
  };
  
  // Handle cookies
  self.cookie = function(name, value, days) {
    // Write/erase cookie
    if (!self.undef(value)) {
      var expires = '',
          domain = document.domain;
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toGMTString();
      }
      document.cookie = escape(name) + '=' + JSON.stringify(value) + expires + '; path=/; domain=' + domain + '; secure';
    }
    
    // Read cookie
    else {
      var nameEQ = escape(name) + '=',
          ca = document.cookie.split(';'),
          i, m, c;
      for (i = 0, m = ca.length; i < m; ++i) {
        c = self.trim(ca[i]);
        if (c.indexOf(nameEQ) === 0) {
          return JSON.parse(c.substring(nameEQ.length));
        }
      }
      return value; // undefined
    }
  };
  
  // Trim characters from the beginning and end from a string
  self.trim = function(str, chars) {
    return self.ltrim(self.rtrim(str, chars), chars);
  };
  
  // Trim characters from the beginning of a string
  self.ltrim = function(str, chars) {
    chars = self.undef(chars) ? ' ' : chars;
    return str.replace(new RegExp('^[' + chars + ']+', 'g'), '');
  };
  
  // Trim characters from the end of a string
  self.rtrim = function(str, chars) {
    chars = self.undef(chars) ? ' ' : chars;
    return str.replace(new RegExp('[' + chars + ']+$', 'g'), '');
  };
  
  // Pad string
  self.pad = function(str, len, pad, dir) {
    len = typeof len === 'undefined' ? 0 : len;
    pad = typeof pad === 'undefined' ? ' ' : pad;
    dir = typeof dir === 'undefined' ? 2 : dir;
    if (len > str.length) {
      switch (dir) {
        case 1: // left
          str = Array(len+1-str.length).join(pad) + str;
          break;
        case 2: // right
          str = str + Array(len+1-str.length).join(pad);
          break;
        case 3: // both
          var padlen = len - str.length,
              right = Math.ceil(padlen / 2),
              left = padlen - right;
          str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
          break;
      }
    }
    return str;
  };
  
  // Upper Case first letter of string
  self.ucFirst = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  
  // Upper Case first letter of each word in string
  self.ucWords = function(str) {
    var words = $.map(str.split(' '), function(s, i) {
      return self.ucFirst(s);
    });
    return words.join(' ');
  };
  
  // Get path from link
  self.path = function(link) {
    return link.pathname;
  };
  
  // Sort object by parameter
  self.sort = function (o, key) {
    var list = [],
        x;
    for (x in o) {
      if (o.hasOwnProperty(x)) {
        list.push(o[x]);
      }
    }
    list.sort(function(a, b) {
      return a[key] - b[key];
    });
    return list;
  };
  
  // Redirect
  self.redirect = function(url) {
    window.location.replace(url);
  };
  
  // Replace strings like sprintf
  self.sprintf = function(format) {
    var arg = arguments;
    var i = 1;
    if ($.isArray(arg[1])) {
      arg = arg[1];
      i = 0;
    }
    return format.replace(/%((%)|s)/g, function(m){
      return m[2] || arg[i++];
    });
  };
  
  // Clear text selection
  self.clearSelection = function() {
    if (document.selection) {
      document.selection.empty();
    } else if (window.getSelection) {
      window.getSelection().removeAllRanges();
    }
  };
  
  self.debug = function() {
    var i, m, a = [];
    for (i = 1, m = arguments.length; i < m; ++i) {
      a.push(arguments[i]);
    }
    if (!self.undef(window.console) && !self.undef(console.log)) {
      if (a.length) {
        console.log(arguments[0], a);
      } else {
        console.log(arguments[0]);
      }
    }
  };
  
  self.group = function() {
    if (self.undef(window.console) ||
          self.undef(console.groupCollapsed) ||
          self.undef(console.groupEnd) ||
          self.undef(console.trace)) {
      return;
    }
    if (arguments.length) {
      var i,
          m,
          a = [];
      for (i = 1, m = arguments.length; i < m; ++i) {
        a.push(arguments[i]);
      }
      if (a.length) {
        console.groupCollapsed(arguments[0], a);
      } else {
        console.groupCollapsed(arguments[0]);
      }
      console.groupCollapsed('trace');
      console.trace();
      console.groupEnd();
    } else {
      console.groupEnd();
    }
  };
  
  // Error message
  self.error = function() {
    if (!self.undef(window.console) && !self.undef(console.log)) {
      console.log(arguments);
    }
  };
  
  // Disable selection
  self.disableSelection = function(element) {
    var $el = $(element);
    if (!self.undef($el.prop('onselectstart'))) {
      $el.bind('selectstart.disableSelection', function(){
        return false;
      });
    } else if ($el.css('MozUserSelect')) {
      if (self.undef($el.data('css.MozUserSelect'))) {
        $el.data('css.MozUserSelect', $el.css('MozUserSelect'));
      }
      $el.css('MozUserSelect', 'none');
    } else {
      $el.bind('mousedown.disableSelection', function(){
        return false;
      });
    }
    if (self.undef($el.data('css.cursor'))) {
      $el.data('css.cursor', $el.css('cursor'));
    }
    $el.css('cursor', 'default');
  };
  
  // Enable selection
  self.enableSelection = function(element) {
    var $el = $(element);
    $el.unbind('selectstart.disableSelection');
    $el.unbind('mousedown.disableSelection');
    $el.css('cursor', $el.data('css.cursor'));
    if (!self.undef($el.data('css.MozUserSelect'))) {
      $el.css('MozUserSelect', $el.data('css.MozUserSelect'));
    }
  };
  
  // Handle text selections when altering with buttons
  self.icon = function(element) {
    var $el = $(element);
    $el.bind('mousedown', function(){
      self.disableSelection(document.documentElement);
      $(document).bind('mouseup.disabledSelection', function(){
        self.enableSelection(document.documentElement);
        $(document).unbind('mouseup.disabledSelection');
      });
    });
  };
  
  self.recursiveMatch = function () {
    var	formatParts = /^([\S\s]+?)\.\.\.([\S\s]+)/,
        metaChar = /[\-\[\]{}()*+?.\\\^$|,]/g,
        escape = function (str) {
          return str.replace(metaChar, '\\$&');
        };

    return function (str, format) {
      var p = formatParts.exec(format);
      if (!p) { throw new Error('format must include start and end tokens separated by \'...\''); }
      if (p[1] === p[2]) { throw new Error('start and end format tokens cannot be identical'); }

      var	opener = p[1],
          closer = p[2],
          /* Use an optimized regex when opener and closer are one character each */
          iterator = new RegExp(format.length === 5 ? '[' + escape(opener + closer) + ']' : escape(opener) +  '|' + escape(closer), 'g'),
          results = [],
          openTokens, matchStartIndex, match;

      do {
        openTokens = 0;
        while ((match = iterator.exec(str))) {
          if (match[0] === opener) {
            if (!openTokens) {
              matchStartIndex = iterator.lastIndex;
            }
            openTokens++;
          } else if (openTokens) {
            openTokens--;
            if (!openTokens) {
              results.push(str.slice(matchStartIndex, match.index));
            }
          }
        }
      } while (openTokens && (iterator.lastIndex = matchStartIndex));

      return results;
    };
  }();
  
  // AJAX
  self.ajax = function(url, key, method, error, success, data, complete) {
    var options = {
      async : true,
      cache : false,
      contentType : 'application/x-www-form-urlencoded; charset=UTF-8',
      dataType : 'json',
      ifModified : false,
      processData : true,
      headers : {},
      url : null
    };
    if (typeof url === 'string') {
      options.data = data || '';
      options.error = error;
      options.success = success;
      options.complete = complete;
      options.url = url;
      options.headers.LISTA_KEY = key;
    } else {
      options.data = url.data || '';
      options.error = url.error;
      options.success = url.success;
      options.complete = url.complete;
      options.url = url.url || self.settings.uri.uri;
      options.headers.LISTA_KEY = url.key;
    }
    options.type = options.data ? 'POST' : 'GET';
    return $.ajax(options);
  };
  
  // Generate a random identifier
  self.uniqueid = function(prefix, length) {
    length = length || 32;
    prefix = prefix || '';
    var id = String.fromCharCode(Math.floor((Math.random() * 25) + 65));
    do {
      var code = Math.floor((Math.random() * 42) + 48);
      if (code < 58 || code > 64) {
        id += String.fromCharCode(code);
      }
    } while (id.length < length);
    return prefix + id;
  };
  
  // Make an element ID safe
  self.safeid = function(id, separator) {
    var separator = self.undef(separator) ? '-' : separator;
    return id
    .toLowerCase()
    .replace(/å|ä|á|à/g, 'a')
    .replace(/ö|ó|ò/g, 'o')
    .replace(/[^a-z0-9]/g, separator);
  };
  
  // Check rpc response and build get function
  self.rpcCheck = function(rpc) {
    alert('meddela mathias [kod:1]');
    if (!self.undef(rpc.error) ||
        self.undef(rpc.result)) {
      return false;
    } else {
      jQuery.extend(rpc, {
        get : function(index, name) {
          return rpc.result[1][index][rpc.result[0][name]];
        }
      });
      return true;
    }
  };
  
  /**
   * Check if variable is undefined.
   */
  self.undef = function(o) {
    return typeof o === 'undefined';
  };
  
  /**
   * Run on DOM ready
   */
  $(document).ready(function() {
    $('html').addClass('dom-ready');
    
    // Make elements position fixed if scrolled below them
    $('.fixed-element').each(function(){
      var $element = $(this);
      var top = $element.offset().top;
      top -= parseFloat($element.css('marginTop').replace(/auto/, 0));
      $(window).scroll(function() {
        var y = $(this).scrollTop();
        if (y >= top) {
          $element.addClass('position-fixed');
        } else {
          $element.removeClass('position-fixed');
        }
      });
    });
    
    // Process queued messages
    (function() {
      var i,
          m,
          messages = !self.undef(self.settings.dom) && 
              !self.undef(self.settings.dom.messages) ? self.settings.dom.messages : [],
          $container = $('#messages .messages-inner');
      $container.mouseenter(function() {
        $container.children('.message').stop(true).queue(function(next) {
          $(this).css({
            opacity : 1,
            height : '100%',
            display : 'block'
          });
          next();
        });
      }).mouseleave(function() {
        $container.children('.message').stop(true).delay(1000).fadeOut(3000, function() {
          $(this).remove();
        });
      });

      // Create messages
      for (i = 0, m = messages.length; i < m; ++i) {
        self.message(
          {},
          messages[i].text,
          messages[i].type,
          messages[i].classes
        ).appendToQueue();
      }
      self.message().processQueue();
    })();
  });
  
  $(window).load(function() {
    $('html').addClass('dom-loaded');
  });
  
}(jQuery));

/**
 * Message handling
 * - lista.message()
 */
var _messageQueue = [];
(function($){
  'use strict';
  var self = lista,
      messageCount = 0;
  self.message = function(options) {
    var args = Array.prototype.slice.call(arguments, 1),
        plugin = {},
        message = {},
        states = {
          'informative' : 1,
          'warning' : 2,
          'error' : 3,
          'success' : 4,
          'failure' : 5,
          'system' : 6,
          'undefined' : 10
        };
    
    // Clean method call
    // options = undefined
    if (self.undef(options)) {
      plugin.processQueue = processQueue;
    }
    
    // Method call with either predefined message object
    // or message parameters passed or mix of both
    // options = {...}
    else if ($.isPlainObject(options)) {
      message = options;
      if (args.length > 0) {
        if (self.undef(message.id)) {
          messageCount++;
          message.id = 'message-id-' + messageCount;
        }
        if (!self.undef(message.dom) && message.dom) {
          message.dom.remove();
        }
        message.id = message.id;
        message.text = args.length > 0 ? args[0] : '';
        message.dom = null;
        message.type = (args.length > 1 ?
          (!self.undef(states[args[1]]) ? args[1] : 'undefined') :
          (!self.undef(message.type) ? message.type : 'informative'));
        message.classes = (args.length > 2 ?
          args[2] :
          (!self.undef(message.classes) ? message.classes : ''));
      }
      plugin.appendToQueue = function() { appendToQueue(message); };
      plugin.create = function(delay) { create(message, delay); };
    }
    
    // Clean message output
    // options = string
    else {
      messageCount++;
      message.id = 'message-id-' + messageCount;
      message.text = options;
      message.dom = null;
      message.type = (args.length > 0 ?
        (!self.undef(states[args[0]]) ? args[0] : 'undefined') :
        'informative');
      message.classes = args.length > 1 ? args[1] : '';
      create(message);
    }

    return $.extend(true, plugin, message);
  };
  
  /**
   * Create message.
   */
  function create(message, delay) {
    delay = !self.undef(delay) ? delay : 0;
    var stay = 6000,
        $container = $('#messages .messages-inner');
        
    // Build message element
    message.dom = $('<div class="message '+ message.type +'"><div class="message-inner padding">' +
      '<div id="' + message.id + '">' + message.text + '</div></div></div>');
    
    // If container exists, direct output
    if ($container.length) {
      message.dom
        .hide()
        .appendTo($container)
        .delay(delay)
        .fadeIn('fast')
        .delay(stay)
        .animate({
          height : 'toggle',
          opacity : 'toggle'
        }, 'slow', function() {
          $(this).remove();
        });
    } 
    
    // Save to queue if not
    else {
      self.message(message).appendToQueue();
    }
  }
  
  /**
   * Append message to message queue.
   */
  function appendToQueue(message) {
    _messageQueue.push(message);
  }
  
  /**
   * Process queue.
   */
  function processQueue() {
    var delay = 150,
        messages = _messageQueue;
        
    // Clear queue
    _messageQueue = [];
    
    // Process messages
    $.each(messages, function(i) {
      self.message(this).create(delay * (i + 1));
    });
  }
}(jQuery));
