angular
  .module('ActiveResource.Mocks')
  .provider('Post', function() {
    this.$get = ['ActiveResource',
      function(ActiveResource) {
      function Post(data) {
        if (!data) data = {};
        this.title  = data.title  || undefined;
        
        this.belongsTo('author', {foreignKey: 'author_id'});
        this.hasMany('comments');

        var content;
        Object.defineProperty(this, 'content', {
          enumerable: true,
          get: function()    { return content; },
          set: function(val) { content = val;  }
        });

      };

      var date;
      Object.defineProperty(Post.prototype, 'date', {
        enumerable: true,
        get: function()    { return date; },
        set: function(val) { date = val;  }
      });

      Post = ActiveResource.Base.apply(Post);
      Post.primaryKey = '_id';
      Post.dependentDestroy('comments');
      Post.api.set('http://api.faculty.com/');
      return Post;
    }];
  });
