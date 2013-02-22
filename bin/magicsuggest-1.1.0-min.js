var MagicSuggest=Class.create({init:function(cfg){this.allowFreeEntries=cfg.allowFreeEntries!==undefined?cfg.allowFreeEntries:true;this.preselectSingleSuggestion=cfg.preselectSingleSuggestion!==undefined?cfg.preselectSingleSuggestion:true;this.cls=cfg.cls||"";this.data=cfg.data!==undefined?cfg.data:null;this.disabled=!!cfg.disabled;this.displayField=cfg.displayField||"name";this.editable=cfg.editable!==undefined?cfg.editable:true;this.emptyText=cfg.emptyText!==undefined?cfg.emptyText:this.editable===true?"Type or click here":"Click here";this.emptyTextCls=cfg.emptyTextCls||"ms-empty-text";this.expanded=!!cfg.expanded;this.expandOnFocus=this.editable===false?true:!!cfg.expandOnFocus;this.hideTrigger=!!cfg.hideTrigger;this.highlight=cfg.highlight!==undefined?cfg.highlight:true;this.id=cfg.id||"ms-ctn-"+$('div[id^="ms-ctn"]').length;this.infoMsgCls=cfg.infoMsgCls||"";this.inputCfg=cfg.inputCfg||{};this.invalidCls=cfg.invalidCls||"ms-ctn-invalid";this.groupBy=cfg.groupBy!==undefined?cfg.groupBy:null;this.matchCase=!!cfg.matchCase;this.maxDropHeight=cfg.maxDropHeight||290;this.maxEntryLength=cfg.maxEntryLength!==undefined?cfg.maxEntryLength:null;this.maxEntryRenderer=cfg.maxEntryRenderer||function(v){return"Please reduce your entry by "+v+" character"+(v>1?"s":"")};this.maxSuggestions=cfg.maxSuggestions!==undefined?cfg.maxSuggestions:null;this.maxSelection=cfg.maxSelection!==undefined?cfg.maxSelection:10;this.maxSelectionRenderer=cfg.maxSelectionRenderer||function(v){return"You cannot choose more than "+v+" item"+(v>1?"s":"")};this.method=cfg.method||"POST";this.minChars=$.isNumeric(cfg.minChars)?cfg.minChars:0;this.minCharsRenderer=cfg.minCharsRenderer||function(v){return"Please type "+v+" more character"+(v>1?"s":"")};this.noSuggestionText=cfg.noSuggestionText||"No suggestions";this.renderer=cfg.renderer||null;this.renderTo=cfg.renderTo||null;this.required=!!cfg.required;this.resultAsString=!!cfg.resultAsString;this.selectionCls=cfg.selectionCls||"";if($.type(cfg.selectionPosition)==="string"){if(["right","bottom","inner"].indexOf(cfg.selectionPosition.toLowerCase())===-1){throw"selectionPosition is not valid. Only 'right', 'bottom' and 'inner' are accepted"}this.selectionPosition=cfg.selectionPosition.toLowerCase()}else{this.selectionPosition="inner"}this.selectionStacked=!!cfg.selectionStacked;if(this.selectionStacked===true&&this.selectionPosition!=="bottom"){this.selectionPosition="bottom"}if($.type(cfg.sortDir)==="string"){if(["asc","desc"].indexOf(cfg.sortDir.toLowerCase())===-1){throw"sortDir is not valid. Only 'asc' and 'desc' are accepted"}this.sortDir=cfg.sortDir.toLowerCase()}else{this.sortDir="asc"}this.sortOrder=cfg.sortOrder!==undefined?cfg.sortOrder:null;this.strictSuggest=!!cfg.strictSuggest;this.style=cfg.style||"";this.useTabKey=!!cfg.useTabKey;this.useCommaKey=cfg.useCommaKey!==undefined?cfg.useCommaKey:true;this.useZebraStyle=cfg.useZebraStyle!==undefined?cfg.useZebraStyle:true;this.value=cfg.value!==undefined?cfg.value:null;this.valueField=cfg.valueField||"id";this.width=cfg.width||$(this.renderTo).width();this._events=["afterrender","beforerender","blur","collapse","expand","focus","onbeforeload","onkeydown","onkeydown","onkeyup","onload","ontriggerclick","selectionchange"];this._selection=[];this._comboItemHeight=0;if(this.renderTo!==null){this._doRender()}return this},addToSelection:function(items){if(!this.maxSelection||this._selection.length<this.maxSelection){if(!$.isArray(items)){items=[items]}var ref=this,valuechanged=false;$.each(items,function(index,json){if(ref.getValue().indexOf(json[ref.valueField])===-1){ref._selection.push(json);valuechanged=true}});if(valuechanged===true){this._renderSelection();this.input.val("");$(this).trigger("selectionchange",[this,this.getSelectedItems()])}}},collapse:function(){if(this.expanded===true){this.combobox.detach();this.expanded=false;$(this).trigger("collapse",[this])}},disable:function(){this.container.addClass("ms-ctn-disabled");this.disabled=true},enable:function(){this.container.removeClass("ms-ctn-disabled");this.disabled=false},expand:function(){if(!this.expanded&&this.input.val().length>=this.minChars){this.combobox.appendTo(this.container);this._processSuggestions();this.expanded=true;$(this).trigger("expand",[this])}},isDisabled:function(){return this.disabled},isRendered:function(){return this._rendered===true},isValid:function(){return this.required===false||this._selection.length>0},getSelectedItems:function(){return this._selection},getValue:function(){var ref=this;return $.map(this._selection,function(o){return o[ref.valueField]})},removeFromSelection:function(items){if(!$.isArray(items)){items=[items]}var ref=this,valuechanged=false;$.each(items,function(index,json){var i=ref.getValue().indexOf(json[ref.valueField]);if(i>-1){ref._selection.splice(i,1);valuechanged=true}});if(valuechanged===true){this._renderSelection();$(this).trigger("selectionchange",[this,this.getSelectedItems()]);if(this.expanded){this._processSuggestions()}}},render:function(el){if(this.isRendered()===false){this.renderTo=el;this._doRender()}},setValue:function(data){var values=$.isArray(data)?data:[data],ref=this,items=[];$.each(this.combobox.children(),function(index,suggestion){var obj=$(suggestion).data("json");if(values.indexOf(obj[ref.valueField])>-1){items.push(obj)}});if(items.length>0){this.addToSelection(items)}},_doRender:function(){if(this.isRendered()===false){$(this).trigger("beforerender",[this]);this.container=$("<div/>",{id:this.id,"class":"ms-ctn "+this.cls+(this.disabled===true?" ms-ctn-disabled":"")+(this.editable===true?"":" ms-ctn-readonly"),style:"width: "+this.width+"px;"+this.style});this.container.focus($.proxy(this._onFocus,this));this.container.blur($.proxy(this._onBlur,this));this.container.keydown($.proxy(this._onHandleKeyDown,this));this.container.keyup($.proxy(this._onHandleKeyUp,this));this.input=$("<input/>",$.extend({id:"ms-input-"+$('input[id^="ms-input"]').length,type:"text","class":this.emptyTextCls+(this.editable===true?"":" ms-input-readonly"),value:this.emptyText,readonly:!this.editable,style:"width: "+(this.width-(this.hideTrigger?16:44))+"px;"},this.inputCfg));this.input.focus($.proxy(this._onInputFocus,this));if(this.hideTrigger===false){this.trigger=$("<div/>",{id:"ms-trigger-"+$('div[id^="ms-trigger"]').length,"class":"ms-trigger",html:'<div class="ms-trigger-ico"></div>'});this.trigger.click($.proxy(this._onTriggerClick,this));this.container.append(this.trigger)}this.combobox=$("<div/>",{id:"ms-res-ctn-"+$('div[id^="ms-res-ctn"]').length,"class":"ms-res-ctn ",style:"width: "+this.width+"px; height: "+this.maxDropHeight+"px;"});this.selectionContainer=$("<div/>",{id:"ms-sel-ctn-"+$('div[id^="ms-sel-ctn"]').length,"class":"ms-sel-ctn"});this.selectionContainer.click($.proxy(this._onFocus,this));if(this.selectionPosition==="inner"){this.selectionContainer.append(this.input)}else{this.container.append(this.input)}this.helper=$("<div/>",{"class":"ms-helper "+this.infoMsgCls});this._updateHelper();this.container.append(this.helper);$(this.renderTo).replaceWith(this.container);switch(this.selectionPosition){case"bottom":this.selectionContainer.insertAfter(this.container);if(this.selectionStacked===true){this.selectionContainer.width(this.container.width());this.selectionContainer.addClass("ms-stacked")}break;case"right":this.selectionContainer.insertAfter(this.container);this.container.css("float","left");break;default:this.container.append(this.selectionContainer);break}this._rendered=true;this._processSuggestions();if(this.value!==null){this.setValue(this.value);this._renderSelection()}$(this).trigger("afterrender",[this]);var ref=this;$("body").click(function(e){if(ref.container.hasClass("ms-ctn-bootstrap-focus")&&ref.container.has(e.target).length===0&&e.target.className.indexOf("ms-res-item")<0&&ref.container[0]!==e.target){ref._onBlur()}});if(this.expanded===true){this.expanded=false;this.expand()}}},_onFocus:function(){this.input.focus()},_onInputFocus:function(){if(this.isDisabled()===false&&!this._hasFocus){this._hasFocus=true;this.container.addClass("ms-ctn-bootstrap-focus");this.container.removeClass(this.invalidCls);if(this.input.val()===this.emptyText){this.input.removeClass(this.emptyTextCls);this.input.val("")}var curLength=this.input.val().length;if(this.expandOnFocus===true&&curLength===0||curLength>this.minChars){this.expand()}if(this._selection.length===this.maxSelection){this._updateHelper(this.maxSelectionRenderer.call(this,this._selection.length))}else if(curLength<this.minChars){this._updateHelper(this.minCharsRenderer.call(this,this.minChars-curLength))}this._renderSelection();$(this).trigger("focus",[this])}},_onBlur:function(){this.container.removeClass("ms-ctn-bootstrap-focus");this.collapse();this._hasFocus=false;this._renderSelection();if(this.isValid()===false){this.container.addClass("ms-ctn-invalid")}if(this.input.val()===""&&this._selection.length===0){this.input.addClass(this.emptyTextCls);this.input.val(this.emptyText)}else if(this.input.val()!==""&&this.allowFreeEntries===false){this.input.val("");this._updateHelper("")}if(this.input.is(":focus")){$(this).trigger("blur",[this])}},_onHandleKeyDown:function(e){var active=this.combobox.find(".ms-res-item-active:first"),freeInput=this.input.val()!==this.emptyText?this.input.val():"";$(this).trigger("onkeydown",[this,e]);if(e.keyCode===9&&(this.useTabKey===false||this.useTabKey===true&&active.length===0&&this.input.val().length===0)){this._onBlur();return}switch(e.keyCode){case 8:if(freeInput.length===0&&this.getSelectedItems().length>0&&this.selectionPosition==="inner"){this._selection.pop();this._renderSelection();$(this).trigger("selectionchange",[this,this.getSelectedItems()]);this.input.focus();e.preventDefault()}break;case 9:case 188:case 13:e.preventDefault();break;case 40:e.preventDefault();this._moveSelectedRow("down");break;case 38:e.preventDefault();this._moveSelectedRow("up");break;default:if(this._selection.length===this.maxSelection){e.preventDefault()}break}},_onHandleKeyUp:function(e){var freeInput=this.input.val()!==this.emptyText?this.input.val():"",inputValid=this.input.val().trim().length>0&&this.input.val()!==this.emptyText&&(!this.maxEntryLength||this.input.val().trim().length<this.maxEntryLength),selected,obj={},ref=this;$(this).trigger("onkeyup",[this,e]);if(e.keyCode===27&&this.expanded){this.collapse()}if(e.keyCode===9&&this.useTabKey===false||e.keyCode>13&&e.keyCode<32){return}switch(e.keyCode){case 40:case 38:e.preventDefault();break;case 13:case 9:case 188:if(e.keyCode!==188||this.useCommaKey===true){e.preventDefault();if(this.expanded===true){selected=this.combobox.find(".ms-res-item-active:first");if(selected.length>0){this._selectItem(selected);return}}if(inputValid===true&&this.allowFreeEntries===true){obj[this.displayField]=obj[this.valueField]=freeInput;this.addToSelection(obj);this.collapse();ref.input.focus()}break}default:if(this._selection.length===this.maxSelection){this._updateHelper(this.maxSelectionRenderer.call(this,this._selection.length))}else{if(freeInput.length<this.minChars){this._updateHelper(this.minCharsRenderer.call(this,this.minChars-freeInput.length));if(this.expanded===true){this.combobox.collapse()}}else if(this.maxEntryLength&&freeInput.length>this.maxEntryLength){this._updateHelper(this.maxEntryRenderer.call(this,freeInput.length-this.maxEntryLength));if(this.expanded===true){this.combobox.collapse()}}else{this.helper.hide();if(this.expanded===true){this._processSuggestions()}else if(freeInput.length>=this.minChars&&this.expanded===false){this.expand()}}}break}},_onTriggerClick:function(){if(this.isDisabled()===false){$(this).trigger("ontriggerclick",[this]);if(this.expanded===true){this.collapse()}else{this.input.focus();this.expand()}}},_processSuggestions:function(){var json=null;if(this.data!==null){if(typeof this.data==="string"&&this.data.indexOf(",")<0){$(this).trigger("onbeforeload",[this]);var ref=this;$.ajax({type:this.method,url:this.data,data:{query:this.input.val()},success:function(items){if(typeof items==="string"){json=JSON.parse(items)}else if(items.results!==undefined){json=items.results}else if($.isArray(items)){json=items}$(this).trigger("onload",[ref,json]);ref._displaySuggestions(ref._sortAndTrim(json))},error:function(){throw"Could not reach server"}})}else if(typeof this.data==="string"&&this.data.indexOf(",")>-1){this._displaySuggestions(this._sortAndTrim(this._getEntriesFromStringArray(this.data.split(","))))}else{if(this.data.length>0&&typeof this.data[0]==="string"){this._displaySuggestions(this._sortAndTrim(this._getEntriesFromStringArray(this.data)))}else{this._displaySuggestions(this._sortAndTrim(this.data))}}}},_getEntriesFromStringArray:function(data){var json=[],ref=this;$.each(data,function(index,s){var entry={};entry[ref.displayField]=entry[ref.valueField]=s.trim();json.push(entry)});return json},_sortAndTrim:function(data){var ref=this,q=this.input.val()!==this.emptyText?this.input.val():"",filtered=[],newSuggestions=[],selectedValues=this.getValue();if(q.length>0){$.each(data,function(index,obj){var name=obj[ref.displayField];if(ref.matchCase===true&&name.indexOf(q)>-1||ref.matchCase===false&&name.toLowerCase().indexOf(q.toLowerCase())>-1){if(ref.strictSuggest===false||name.toLowerCase().indexOf(q.toLowerCase())===0){filtered.push(obj)}}})}else{filtered=data}$.each(filtered,function(index,obj){if(selectedValues.indexOf(obj[ref.valueField])===-1){newSuggestions.push(obj)}});if(this.sortOrder!==null){newSuggestions.sort(function(a,b){if(a[ref.sortOrder]<b[ref.sortOrder]){return ref.sortDir==="asc"?-1:1}if(a[ref.sortOrder]>b[ref.sortOrder]){return ref.sortDir==="asc"?1:-1}return 0})}if(this.maxSuggestions&&this.maxSuggestions>0){newSuggestions=newSuggestions.slice(0,this.maxSuggestions)}if(this.groupBy!==null){this._groups={};$.each(newSuggestions,function(index,value){if(ref._groups[value[ref.groupBy]]===undefined){ref._groups[value[ref.groupBy]]={title:value[ref.groupBy],items:[value]}}else{ref._groups[value[ref.groupBy]].items.push(value)}})}return newSuggestions},_displaySuggestions:function(data){this.combobox.empty();var ref=this,resHeight=0,nbGroups=0;if(this._groups===undefined){this._renderComboItems(data);resHeight=ref._comboItemHeight*data.length}else{for(var grpName in this._groups){nbGroups+=1;$("<div/>",{"class":"ms-res-group",html:grpName}).appendTo(ref.combobox);this._renderComboItems(this._groups[grpName].items,true)}resHeight=ref._comboItemHeight*(data.length+nbGroups)}if(resHeight<this.combobox.height()||resHeight<this.maxDropHeight){this.combobox.height(resHeight)}else if(resHeight>=this.combobox.height()&&resHeight>this.maxDropHeight){this.combobox.height(this.maxDropHeight)}if(data.length===1&&this.preselectSingleSuggestion===true){this.combobox.children().filter(":last").addClass("ms-res-item-active")}if(data.length===0){this._updateHelper(this.noSuggestionText);this.combobox.collapse()}},_renderComboItems:function(items,isGrouped){var ref=this;$.each(items,function(index,value){var displayed=ref.renderer!==null?ref.renderer.call(ref,value):value[ref.displayField];var resultItemEl=$("<div/>",{"class":"ms-res-item "+(isGrouped?"ms-res-item-grouped ":"")+(index%2===1&&ref.useZebraStyle===true?"ms-res-odd":""),html:ref.highlight===true?ref._highlightSuggestion(displayed):displayed}).data("json",value);resultItemEl.click($.proxy(ref._onComboItemSelected,ref));resultItemEl.mouseover($.proxy(ref._onComboItemMouseOver,ref));ref.combobox.append(resultItemEl)});this._comboItemHeight=this.combobox.find(".ms-res-item:first").outerHeight()},_highlightSuggestion:function(html){var q=this.input.val()!==this.emptyText?this.input.val():"";if(q.length===0){return html}if(this.matchCase===true){html=html.replace(new RegExp("("+q+")","g"),"<em>$1</em>")}else{html=html.replace(new RegExp("("+q+")","gi"),"<em>$1</em>")}return html},_onComboItemMouseOver:function(e){this.combobox.children().removeClass("ms-res-item-active");$(e.currentTarget).addClass("ms-res-item-active")},_onComboItemSelected:function(e){this._selectItem($(e.currentTarget))},_selectItem:function(item){this.addToSelection(item.data("json"));item.removeClass("ms-res-item-active");this.collapse();this.input.focus()},_renderSelection:function(){var ref=this,w=0,inputOffset=0,items=[],asText=this.resultAsString===true&&this._hasFocus===false;this.selectionContainer.find(".ms-sel-item").remove();$.each(this._selection,function(index,value){var selectedItemEl,delItemEl;if(asText===true){selectedItemEl=$("<div/>",{"class":"ms-sel-item ms-sel-text "+ref.selectionCls,html:value[ref.displayField]+(index===ref._selection.length-1?"":",")}).data("json",value)}else{selectedItemEl=$("<div/>",{"class":"ms-sel-item "+ref.selectionCls,html:value[ref.displayField]}).data("json",value);delItemEl=$("<span/>",{"class":"ms-close-btn"}).data("json",value).appendTo(selectedItemEl);delItemEl.click($.proxy(ref._onRemoveFromSelection,ref))}items.push(selectedItemEl)});this.selectionContainer.prepend(items);if(this.selectionPosition==="inner"){this.input.width(0);if(this.editable===true||this._selection.length===0){inputOffset=this.input.offset().left-this.selectionContainer.offset().left;w=this.container.width()-inputOffset-32-(this.hideTrigger===true?0:42);this.input.width(w<100?100:w)}this.container.height(this.selectionContainer.height())}},_onRemoveFromSelection:function(e){this.removeFromSelection($(e.currentTarget).data("json"))},_moveSelectedRow:function(dir){if(!this.expanded){this.expand()}var list,start,active,scrollPos;list=this.combobox.find(".ms-res-item");if(dir==="down"){start=list.eq(0)}else{start=list.filter(":last")}active=this.combobox.find(".ms-res-item-active:first");if(active.length>0){if(dir==="down"){start=active.nextAll(".ms-res-item").first();if(start.length===0){start=list.eq(0)}scrollPos=this.combobox.scrollTop();this.combobox.scrollTop(0);if(start[0].offsetTop+start.outerHeight()>this.combobox.height()){this.combobox.scrollTop(scrollPos+this._comboItemHeight)}}else{start=active.prevAll(".ms-res-item").first();if(start.length===0){start=list.filter(":last");this.combobox.scrollTop(this._comboItemHeight*list.length)}if(start[0].offsetTop<this.combobox.scrollTop()){this.combobox.scrollTop(this.combobox.scrollTop()-this._comboItemHeight)}}}list.removeClass("ms-res-item-active");start.addClass("ms-res-item-active")},_updateHelper:function(html){this.helper.html(html);if(!this.helper.is(":visible")){this.helper.fadeIn()}}});