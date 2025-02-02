var $ = require('jquery');
var cdb = require('cartodb.js');
var FavMapView = require('./fav_map_view');
var UserInfoView = require('./user_info_view');
var PaginationModel = require('../common/views/pagination/model');
var PaginationView = require('../common/views/pagination/view');
var UserSettingsView = require('../public_common/user_settings_view');
var UserTourView = require('../public_common/user_tour_view');
var UserIndustriesView = require('../public_common/user_industries_view');
var UserResourcesView = require('../public_common/user_resources_view');
var UserDiscoverView = require('../public_common/user_discover_view');
var MapCardPreview = require('../common/views/mapcard_preview');
var LikeView = require('../common/views/likes/view');
var ScrollableHeader = require('../common/views/scrollable_header');

$(function() {
  cdb.init(function() {
    cdb.templates.namespace = 'cartodb/';
    cdb.config.set(window.config);
    cdb.config.set('url_prefix', window.base_url);

    var scrollableHeader = new ScrollableHeader({
      el: $('.js-Navmenu'),
      anchorPoint: 350
    });

    var userTourView = new UserTourView({
      el: $('.js-user-tour')
    });

    var userIndustriesView = new UserIndustriesView({
      el: $('.js-user-industries')
    });

    var userResourcesView = new UserResourcesView({
      el: $('.js-user-resources')
    });

    var userDiscoverView = new UserDiscoverView({
      el: $('.js-user-discover')
    });

    $(document.body).bind('click', function() {
      cdb.god.trigger('closeDialogs');
    });

    var authenticatedUser = new cdb.open.AuthenticatedUser();
    authenticatedUser.bind('change', function() {
      if (authenticatedUser.get('username')) {
        var user = new cdb.admin.User(authenticatedUser.attributes);
        var userSettingsView = new UserSettingsView({
          el: $('.js-user-settings'),
          model: user
        });
        userSettingsView.render();

        $('.js-login').hide();
        $('.js-learn').show();
      }
    });

    var favMapView = new FavMapView(window.favMapViewAttrs);
    favMapView.render();

    var userInfoView = new UserInfoView({
      el: $('.js-user-info')
    });
    userInfoView.render();

    var paginationView = new PaginationView({
      el: '.js-content-footer',
      model: new PaginationModel(window.paginationModelAttrs)
    });
    paginationView.render();

    $('.MapCard').each(function() {
      var visId = $(this).data('visId');
      if (visId) {
        var mapCardPreview = new MapCardPreview({
          el: $(this).find('.js-header'),
          height: 220,
          visId: $(this).data('visId'),
          username: $(this).data('visOwnerName'),
          mapsApiHost: cdb.config.getMapsApiHost()
        });
        mapCardPreview.load();
      }
    });

    $('.js-likes').each(function() {
      var likeModel = cdb.admin.Like.newByVisData({
        url: !cdb.config.get('url_prefix') ? $(this).attr('href') : '' ,
        likeable: false,
        show_count: $(this).data('show-count') || false,
        show_label: $(this).data('show-label') || false,
        vis_id: $(this).data('vis-id'),
        likes: $(this).data('likes-count')
      });
      authenticatedUser.bind('change', function() {
        if (authenticatedUser.get('username')) {
          likeModel.bind('loadModelCompleted', function() {
            likeModel.set('likeable', true);
          });
          likeModel.fetch();
        }
      });
      var likeView = new LikeView({
        el: this,
        model: likeModel
      });
      likeView.render();
    });

    authenticatedUser.fetch();
  });
});
