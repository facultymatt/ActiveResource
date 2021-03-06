angular
  .module('ActiveResource')
  .provider('ARAssociation', function() {
    this.$get = ['$injector', 'ARBelongsTo', function($injector, BelongsTo) {
      function Association(type, instance, table, options) {
        if (options.provider)   var providerName = options.provider;
        else                    var providerName = table.classify();

        if (type == 'BelongsTo') {
          if (options.foreignKey) this.foreignKey = options.foreignKey;
          else                    this.foreignKey = table.singularize() + "_id";
          BelongsTo(this, instance, table, options);
        }

        this.klass = $injector.get(providerName);
        Association.cached[instance.constructor.name.toLowerCase() + ':' + table] = this;
      }; 
      Association.cached = {};
      return Association;
    }];
  })
  .provider('ARBelongsTo', function() {
    this.$get = function() {
      function BelongsTo(association, instance, table, options) {
        var localTable = undefined;
        Object.defineProperty(instance, table, {
          enumerable: true,
          get: function()    { return localTable; },
          set: function(val) {
           if (val === undefined) { localTable = val; return; }
           if (val.constructor.name == 'String' || val.constructor.name == 'Number') {
             association.klass.find(val).then(function(response) { 
               localTable = response; 
               var thisTableName  = instance.constructor.name.pluralize().downcase()
               var belongsToArray = localTable[thisTableName];
               if (instance.id && belongsToArray && !_.include(belongsToArray, instance)) belongsToArray.push(instance);
             });
           } else if (association.klass.name == val.constructor.name) {
             localTable = val;
             var thisTableName  = instance.constructor.name.pluralize().downcase()
             var belongsToArray = localTable[thisTableName];
             if (instance.id && belongsToArray && !_.include(belongsToArray, instance)) belongsToArray.push(instance);
           }
          }
        });
      };
      return BelongsTo;
    };
  })
  .provider('ARAssociations', function() {
    this.$get = function() {
      function Associations(klass) {
        var name           = klass.name.toLowerCase();
        this.belongsTo     = [];
        this.hasMany       = [];
        this.belongsTo.add = add;
        this.hasMany.add   = add;
        
        function add(association) {
          var shouldPush = true;
          _.each(this, function(assoc) { if (assoc.klass == association.klass) shouldPush = false; });
          if (shouldPush) this.push(association);
        };

        if (!Associations.cached[name]) Associations.cached[name] = this;
      }
      Associations.cached = {};
      Associations.get    = function(klass) {
        if (klass.klass) model = klass.klass;
        model.new();
        return Associations.cached[model.name.toLowerCase()];
      };
      Associations.getBelongs = function(klass, instance) {
        var associations = Associations.get(klass);
        var belongs = undefined;
        _.each(associations.belongsTo, function(association) {
          if (association.klass == instance.constructor) belongs = association;
        });
        return belongs;
      };
      return Associations;
    };
  });
