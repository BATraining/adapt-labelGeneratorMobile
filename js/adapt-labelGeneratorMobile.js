/*
 * adapt-labelGeneratorMobile
 * Copyright (C) 2015 Bombardier Inc. (www.batraining.com)
 * https://github.com/BATraining/adapt-labelGeneratorMobile/blob/master/LICENSE
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
define([
    'coreJS/adapt',
    'coreViews/componentView'
], function(Adapt, ComponentView) {

    var LabelGeneratorMobile = ComponentView.extend({

        events: {
            'click .labelGeneratorMobile-strapline-title': 'openPopup',
            'click .notify-popup-icon-close': 'closePopup',
            'click .labelGeneratorMobile-controls': 'onNavigationClicked'
        },

        preRender: function() {
            this.listenTo(Adapt, 'device:changed', this.reRender, this);
            this.listenTo(Adapt, 'device:resize', this.resizeControl, this);
            this.listenTo(Adapt, 'notify:closed', this.closeNotify, this);
            this.setDeviceSize();

            // Checks to see if the labelGeneratorMobile should be reset on revisit
            this.checkIfResetOnRevisit();
        },

        setDeviceSize: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$el.addClass('desktop').removeClass('mobile');
                this.model.set('_isDesktop', true);
            } else {
                this.$el.addClass('mobile').removeClass('desktop');
                this.model.set('_isDesktop', false)
            }
        },

        postRender: function() {
            this.renderState();
            this.$('.labelGeneratorMobile-slider').imageready(_.bind(function() {
                this.setReadyStatus();
            }, this));
            this.straplineHoverSetting();
            this.deleteCommonItem();
            this.setupNarrative();
        },

        deleteCommonItem:function(){
            var similarItem = [];
            _.each(this.model.get("_items"),function(item,index){
                if(item._similarItemId != undefined){
                    if(item._similarItemId != []){
                        similarItem =  item._similarItemId;
                        similarItem.sort(this.sortNumber);

                        if(item.id < similarItem[0]){
                            _.each(item._similarItemId,function(similarItem,index){
                                this.$(".labelGeneratorMobile-strapline-"+(similarItem-1)).remove();
                                this.$(".labelGeneratorMobile-slider-"+(similarItem-1)).remove();
                                this.$(".labelGeneratorMobile-progress-"+(similarItem-1)).remove();
                            },this);
                        }
                    }
                }
            },this);
        },

        sortNumber: function(a,b) {
            return a - b;
        },

        straplineHoverSetting:function(){
            _.each(this.model.get("_items"),function(item,index){
                var $straplineTitle = this.$(".labelGeneratorMobile-strapline-"+index);
                if($straplineTitle.find(".icon-plus").hasClass("icon")){
                    $straplineTitle.addClass("addHover");
                }
            },this);
        },

        // Used to check if the labelGeneratorMobile should reset on revisit
        checkIfResetOnRevisit: function() {
            var isResetOnRevisit = this.model.get('_isResetOnRevisit');

            // If reset is enabled set defaults
            if (isResetOnRevisit) {
                this.model.reset(isResetOnRevisit);
                this.model.set({_stage: 0});

                _.each(this.model.get('_items'), function(item) {
                    item.visited = false;
                });
            }
        },

        setupNarrative: function() {
            _.bindAll(this, 'onTouchMove', 'onTouchEnd');
            this.setDeviceSize();
            this.model.set('_marginDir', 'left');
            if (Adapt.config.get('_defaultDirection') == 'rtl') {
                this.model.set('_marginDir', 'right');
            }
            this.model.set('_itemCount', this.$('.labelGeneratorMobile-slider-graphic').length);

            this.model.set('_active', true);

            if (this.model.get('_stage')) {
                this.setStage(this.model.get('_stage'), true);
            } else {
                this.setStage(0, true);
            }
            this.calculateWidths();

            if (Adapt.device.screenSize !== 'large' && !this.model.get('_wasHotgraphic')) {
                this.replaceInstructions();
            }
        },

        calculateWidths: function() {
            var slideWidth = this.$('.labelGeneratorMobile-slide-container').width();
            var slideCount = this.model.get('_itemCount');
            var marginRight = this.$('.labelGeneratorMobile-slider-graphic').css('margin-right');
            var extraMargin = marginRight === '' ? 0 : parseInt(marginRight);
            var fullSlideWidth = (slideWidth + extraMargin) * slideCount;
            var iconWidth = this.$('.labelGeneratorMobile-popup-open').outerWidth();

            this.$('.labelGeneratorMobile-slider-graphic').width(slideWidth);
            this.$('.labelGeneratorMobile-strapline-header').width(slideWidth);
            this.$('.labelGeneratorMobile-strapline-title').width(slideWidth);

            this.$('.labelGeneratorMobile-slider').width(fullSlideWidth);
            this.$('.labelGeneratorMobile-strapline-header-inner').width(fullSlideWidth);

            var stage = this.model.get('_stage');
            var margin = -(stage * slideWidth);

            this.$('.labelGeneratorMobile-slider').css(('margin-' + this.model.get('_marginDir')), margin);
            this.$('.labelGeneratorMobile-strapline-header-inner').css(('margin-' + this.model.get('_marginDir')), margin);

            this.model.set('_finalItemLeft', fullSlideWidth - slideWidth);
        },

        resizeControl: function() {
            this.setDeviceSize();
            this.replaceInstructions();
            this.calculateWidths();
            this.evaluateNavigation();
        },

        reRender: function() {
            if (this.model.get('_wasLabelGenerator') && Adapt.device.screenSize == 'large') {
                this.replaceWithLabelGenerator();
            }
        },

        closeNotify: function() {
            this.evaluateCompletion();
        },

        replaceInstructions: function() {
            if (Adapt.device.screenSize === 'large') {
                this.$('.labelGeneratorMobile-instruction-inner').children('span').html(this.model.get('instruction'));
            } else if (this.model.get('mobileInstruction') && !this.model.get('_wasLabelGenerator')) {
                this.$('.labelGeneratorMobile-instruction-inner').children('span').html(this.model.get('mobileInstruction'));
            }
        },

        replaceWithLabelGenerator: function() {
            if (!Adapt.componentStore.labelGenerator) throw "LabelGenerator not included in build";
            var LabelGenerator = Adapt.componentStore.labelGenerator;

            var model = this.prepareLabelGeneratorModel();
            var newLabelGenerator = new LabelGenerator({model: model});
            var $container = $(".component-container", $("." + this.model.get("_parentId")));

            $container.append(newLabelGenerator.$el);

            this.remove();
            _.defer(function() {
                Adapt.trigger('device:resize');
            });
        },

        prepareLabelGeneratorModel: function() {
            var model = this.model;
            model.set('_component', 'labelGenerator');
            model.set('body', model.get('originalBody'));
            model.set('instruction', model.get('originalInstruction'));
            return model;
        },

        moveSliderToIndex: function(itemIndex, animate, callback) {
            var extraMargin = parseInt(this.$('.labelGeneratorMobile-slider-graphic').css('margin-right'));
            var movementSize = this.$('.labelGeneratorMobile-slide-container').width() + extraMargin;
            var marginDir = {};
            if (animate) {
                marginDir['margin-' + this.model.get('_marginDir')] = -(movementSize * itemIndex);
                this.$('.labelGeneratorMobile-slider').velocity("stop", true).velocity(marginDir);
                this.$('.labelGeneratorMobile-strapline-header-inner').velocity("stop", true).velocity(marginDir, {complete:callback});
            } else {
                marginDir['margin-' + this.model.get('_marginDir')] = -(movementSize * itemIndex);
                this.$('.labelGeneratorMobile-slider').css(marginDir);
                this.$('.labelGeneratorMobile-strapline-header-inner').css(marginDir);
                callback();
            }
        },

        closePopup: function(event) {
            event.preventDefault();
            Adapt.trigger('popup:closed');
        },

        setStage: function(stage, initial) {
            this.model.set('_stage', stage);
            var currentItem = this.getCurrentItem(stage);

            if (this.model.get('_isDesktop')) {
                // Set the visited attribute for large screen devices
                this.setCommonPopupVisited(currentItem);
                currentItem.visited = true;
                this.evaluateCompletion();
            }

            if(currentItem._hasExtraDescription == undefined || currentItem._hasExtraDescription == false){
                this.setCommonPopupVisited(currentItem);
                currentItem.visited = true;
            }
            this.$('.labelGeneratorMobile-progress').removeClass('selected').eq(stage).addClass('selected');
            this.$('.labelGeneratorMobile-content-item').addClass('labelGeneratorMobile-hidden').a11y_on(false).eq(stage).removeClass('labelGeneratorMobile-hidden').a11y_on(true);

            this.evaluateNavigation();

            this.moveSliderToIndex(stage, !initial, _.bind(function() {
                if (this.model.get('_isDesktop')) {
                    if (!initial) this.$('.labelGeneratorMobile-content-item').eq(stage).a11y_focus();
                } else {
                    if (!initial) this.$('.labelGeneratorMobile-popup-open').a11y_focus();
                }
            }, this));
        },

        setCommonPopupVisited:function(currentItem){
            var similarItem;

            if(currentItem._similarItemId != undefined || currentItem._similarItemId != []){
                var similarItems = currentItem._similarItemId;
                _.each(similarItems,function(similarId,index){
                    similarItem = this.getCurrentItem(similarId-1);
                    similarItem.visited = true;
                },this);
            }
        },
        constrainStage: function(stage) {
            if (stage > this.model.get('_items').length - 1) {
                stage = this.model.get('_items').length - 1;
            } else if (stage < 0) {
                stage = 0;
            }
            return stage;
        },

        constrainXPosition: function(previousLeft, newLeft, deltaX) {
            if (newLeft > 0 && deltaX > 0) {
                newLeft = previousLeft + (deltaX / (newLeft * 0.1));
            }
            var finalItemLeft = this.model.get('_finalItemLeft');
            if (newLeft < -finalItemLeft && deltaX < 0) {
                var distance = Math.abs(newLeft + finalItemLeft);
                newLeft = previousLeft + (deltaX / (distance * 0.1));
            }
            return newLeft;
        },

        evaluateNavigation: function() {
            var currentStage = this.model.get('_stage');
            var itemCount = this.model.get('_itemCount');
            if (currentStage == 0) {
                this.$('.labelGeneratorMobile-control-left').addClass('labelGeneratorMobile-hidden');

                if (itemCount > 1) {
                    this.$('.labelGeneratorMobile-control-right').removeClass('labelGeneratorMobile-hidden');
                }
            } else {
                this.$('.labelGeneratorMobile-control-left').removeClass('labelGeneratorMobile-hidden');

                if (currentStage == itemCount - 1) {
                    this.$('.labelGeneratorMobile-control-right').addClass('labelGeneratorMobile-hidden');
                } else {
                    this.$('.labelGeneratorMobile-control-right').removeClass('labelGeneratorMobile-hidden');
                }
            }
        },

        getNearestItemIndex: function() {
            var currentPosition = parseInt(this.$('.labelGeneratorMobile-slider').css('margin-left'));
            var graphicWidth = this.$('.labelGeneratorMobile-slider-graphic').width();
            var absolutePosition = currentPosition / graphicWidth;
            var stage = this.model.get('_stage');
            var relativePosition = stage - Math.abs(absolutePosition);

            if (relativePosition < -0.3) {
                stage++;
            } else if (relativePosition > 0.3) {
                stage--;
            }

            return this.constrainStage(stage);
        },

        getCurrentItem: function(index) {
            return this.model.get('_items')[index];
        },

        getVisitedItems: function() {
            return _.filter(this.model.get('_items'), function(item) {
                return item.visited;
            });
        },

        evaluateCompletion: function() {

            if (this.getVisitedItems().length === this.model.get("_items").length) {
                this.setCompletionStatus();
            }
        },

        moveElement: function($element, deltaX) {
            var previousLeft = parseInt($element.css('margin-left'));
            var newLeft = previousLeft + deltaX;

            newLeft = this.constrainXPosition(previousLeft, newLeft, deltaX);
            $element.css(('margin-' + this.model.get('_marginDir')), newLeft + 'px');
        },

        openPopup: function(event) {
            event.preventDefault();
            var $strapline = $(event.currentTarget);
            if(!$strapline.find(".icon-plus").hasClass("icon"))return;
            var currentItem = this.getCurrentItem(this.model.get('_stage'));
            var popupObject = {
                title: currentItem.title,
                body: currentItem.body
            };
            // Set the visited attribute for small and medium screen devices
            this.setCommonPopupVisited(currentItem);
            currentItem.visited = true;

            Adapt.trigger('notify:popup', popupObject);
        },

        onNavigationClicked: function(event) {
            event.preventDefault();

            if (!this.model.get('_active')) return;

            var stage = this.model.get('_stage');
            var numberOfItems = this.model.get('_itemCount');

            if ($(event.currentTarget).hasClass('labelGeneratorMobile-control-right')) {
                stage++;
            } else if ($(event.currentTarget).hasClass('labelGeneratorMobile-control-left')) {
                stage--;
            }
            stage = (stage + numberOfItems) % numberOfItems;
            this.setStage(stage);
        },

        onTouchEnd: function(event) {
            var nextItemIndex = this.getNearestItemIndex();
            this.setStage(nextItemIndex);

            this.$('.labelGeneratorMobile-slider').off('touchmove', this.onTouchMove);
        },

        onTouchMove: function(event) {
            var currentX = event.originalEvent.touches[0]['pageX'];
            var previousX = this.model.get('_currentX');
            var deltaX = currentX - previousX;

            Adapt.trigger('popup:closed');

            this.moveElement(this.$('.labelGeneratorMobile-slider'), deltaX);
            this.moveElement(this.$('.labelGeneratorMobile-strapline-header-inner'), deltaX);

            this.model.set('_currentX', currentX);
        }

    });

    Adapt.register('labelGeneratorMobile', LabelGeneratorMobile);

    return LabelGeneratorMobile;

});
