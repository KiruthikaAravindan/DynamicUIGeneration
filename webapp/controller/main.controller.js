sap.ui.define([
	"sap/ui/core/mvc/Controller"
], function (Controller) {
	"use strict";
// Just tesing Git hub desktop
	return Controller.extend("com.inct.dynamicControlsGen1.controller.main", {

		onInit: function () {
			var oDetailModel = new sap.ui.model.json.JSONModel();
			this.getView().setModel(oDetailModel, "oDetailModel");
			oDetailModel.loadData("model/data2.json", null, false);
			oDetailModel.refresh();
			this.createDynamic();
		},

		createDynamic: function () {
			var oPage = this.getView().byId("idPage");
			oPage.removeAllContent();
			oPage.addContent(this.addHeaderDetails());
			var oOuterBox = new sap.m.VBox();
			oOuterBox.bindAggregation("items", "oDetailModel>/contentDto", function (index, context) {
				return this.addControls(context);
			}.bind(this));
			oPage.addContent(oOuterBox);
			oPage.setFooter(this.addFooterDetails());
		},

		addHeaderDetails: function () {
			var headerDto = this.getView().getModel("oDetailModel").getProperty("/headerDto");
			var headerDetailBox = new sap.m.VBox();
			var headerContentClass;
			for (var i = 1; i < headerDto.length; i++) {
				if (i === 1) {
					headerContentClass = "headerTitleClass";
				} else {
					headerContentClass = "headerDescriptionClass";
				}
				headerDetailBox.addItem(
					new sap.m.Text({
						text: headerDto[i].value
					}).addStyleClass(headerContentClass)
				).addStyleClass("headerContentAlignClass");
			}
			return new sap.m.VBox().addItem(
				new sap.m.Label({
					text: headerDto[0].value
				}).addStyleClass("titleClass")).addItem(
				new sap.m.HBox().addItem(
					new sap.f.Avatar({
						displayShape: "Square",
						initials: headerDto[1].value.charAt(0)
					}).addStyleClass("avatarSizeClass avatarColorClass")
				).addItem(headerDetailBox)
			).addStyleClass("outerHeaderBoxClass");
		},

		addFooterDetails: function () {
			var oActionToolbar = new sap.m.Toolbar();
			oActionToolbar.bindAggregation("content", "oDetailModel>/buttonsDto", function (index, context) {
				var sBtnClass = "";
				if (context.getObject().buttonText === "Accept") {
					sBtnClass = "greenBtnClass";

				} else if (context.getObject().buttonText === "Reject") {
					sBtnClass = "redBtnClass";
				}
				var btnControl = new sap.m.Button({
					text: context.getObject().buttonText,
					press: function (oEvent) {
						this.onActionBtnPress(oEvent);
					}.bind(this)
				}).addStyleClass("sapUiSizeCompact sapUiTinyMarginEnd " + sBtnClass);
				oActionToolbar.insertContent(new sap.m.ToolbarSpacer(), 1);
				return btnControl;
			}.bind(this), 1);
			return oActionToolbar;
		},

		addControls: function (currContext) {
			var contentType = currContext.getObject().dataType;
			var newControl;
			if (contentType === "IconTabBar") {
				newControl = new sap.m.IconTabBar().addStyleClass("filterTabBarClass");
				newControl.bindAggregation("items", "oDetailModel>contentDto", function (index, context) {
					var tabBarFilter = new sap.m.IconTabFilter({
						text: "{oDetailModel>label}"
					});
					tabBarFilter.bindAggregation("content", "oDetailModel>contentDto", function (i, c) {
						var content = this.addControls(c);
						return content;
					}.bind(this));
					return tabBarFilter;
				}.bind(this));
			} else if (contentType.includes("Grid")) {
				var divisions = contentType.split("-").pop();
				var sDefaultSpan;
				if (divisions === "1") {
					sDefaultSpan = "L12 M12 S12";
				} else {
					sDefaultSpan = "L3 M6 S12";
				}
				newControl = new sap.ui.layout.Grid({
					defaultSpan: sDefaultSpan,
					vSpacing: 0.5
				}).addStyleClass("sapUiSizeCompact gridBackgroundClass");
				newControl.bindAggregation("content", "oDetailModel>contentDto", function (i, c) {
					return this.addControls(c);
				}.bind(this));
			} else if (contentType === "Table") {
					newControl = this.createTable(new sap.m.Table().addStyleClass("sapUiSizeCompact"), currContext);
				/*newControl = new sap.m.ScrollContainer({
					width:"200%",
					scrollPosition: 50,
					contentSize: "500px",
					horizontal:true
				});
				newControl.addContent(this.createTable(new sap.m.Table().addStyleClass("sapUiSizeCompact"), currContext));
				newControl.placeAt("content");*/
			} else if (contentType === "Select") {
				newControl = new sap.m.Select({
					width: "100%",
					selectedKey: "{oDetailModel>value}",
					enabled: "{oDetailModel>isEditable}",
					name: "{oDetailModel>label}"
				}).addStyleClass("sapUiSizeCompact gridTextClass");
				newControl.bindItems("oDetailModel>attributeValues", function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.attributeValue,
						key: obj.attributeKey
					});
				});
			} else if (contentType === "Input") {
				newControl = new sap.m.Input({
					width: "100%",
					value: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "TextArea") {
				newControl = new sap.m.TextArea({
					width: "100%",
					id: "idDetailActionComment",
					value: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "ComboBox") {
				newControl = new sap.m.ComboBox({
					width: "100%",
					selectedKey: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
				newControl.bindItems("oDetailModel>attributeValues", function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.attributeValue,
						key: obj.attributeKey
					});
				});
			} else if (contentType === "Text") {
				newControl = new sap.m.Text({
					width: "100%",
					text: "{oDetailModel>value}"
				}).addStyleClass("sapUiSizeCompact gridTextContentClass");
			} else if (contentType === "Date") {
				newControl = new sap.m.DatePicker({
					width: "100%",
					value: "{oDetailModel>value}",
					placeholder: "mm/dd/yyyy",
					displayFormat: "MM/dd/yyyy",
					valueFormat: "yyyy-MM-dd",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "List") {
				newControl = this.createList(new sap.m.List().addStyleClass("sapUiSizeCompact"), currContext);
			} else {
				newControl = new sap.m.Text({
					text: "Unexpected Control!"
				});
			}
			var gridTextClass;
			if (currContext.getObject().label) {
				if (currContext.getObject().value || currContext.getObject().value === "") {
					gridTextClass = "gridTextClass";
				} else {
					if (currContext.getObject().dataType) {
						gridTextClass = "headerClass";
					}
				}

				newControl = new sap.m.VBox().addItem(new sap.m.Label({
					text: "{oDetailModel>label}"

				}).addStyleClass(gridTextClass)).addItem(newControl);
			}
			return newControl;
		},

		createTable: function (oTable, currContext) {

			oTable.bindAggregation("columns", "oDetailModel>tableDto/headers", function (index, context) {
				var column = new sap.m.Column({
					header: new sap.m.Text({
						text: "{oDetailModel>name}",
						wrapping: true
					}).addStyleClass("tblHeader")
				});
				return column;
			});
			var itemType;
			if (currContext.getObject().isClickable === true) {
				itemType = "Active";
			}
			oTable.bindItems("oDetailModel>tableDto/lineItemDtos", function (index, context) {
				var obj = context.getObject();
				var row = new sap.m.ColumnListItem({
					type: itemType,
					press: function (oEvent) {
						this.onOpenTask(oEvent);
					}.bind(this)
				});
				for (var k in obj) {
					row.addCell(new sap.m.Text({
						text: obj[k],
						tooltip: obj[k]
					}));
				}
				return row;
			}.bind(this));
			return oTable;
		},

		onActionBtnPress: function (oEvent) {

		},

		onOpenTask: function (oEvent) {
			var currObj = oEvent.getSource().getBindingContext("oDetailModel").getObject();
			if (!this._oAddAttachmentDialog) {
				this._oAddAttachmentDialog = sap.ui.xmlfragment("com.inct.dynamicControlsGen1.fragments.dynamicFragment", this);
				this.getView().addDependent(this._oAddAttachmentDialog);
			}
			this._oAddAttachmentDialog.open();
			var oDialog = sap.ui.getCore().byId("idDialog");

			oDialog.addContent(this.addDialogDetails());
			var oOuterBox = new sap.m.VBox();
			oOuterBox.bindAggregation("items", "oDetailModel>/contentDialogDto", function (index, context) {
				return this.addDialogControls(context);
			}.bind(this));
			oDialog.addContent(oOuterBox);

			/*	var list = new sap.m.CustomListItem().addStyleClass("sapUiSmallMarginBegin");
				list.bindAggregation("items", "oDetailModel>/contentDto", function (index, context) {
					return this.addListControls(context);
				}.bind(this));
				oDialog.addContent(list);*/
			//	oDialog.setFooter(this.addFooterDetails());
			/*	var newDialog = new sap.m.Dialog({
				title: "Title",
				id: "idDialog"
			});
			var oDialog = sap.ui.getCore().byId("idDialog");
			/*oDialog.addContent(this.addDialogDetails());*/
			/*	var oOuterBox = new sap.m.VBox();
				oOuterBox.bindAggregation("items", "oDetailModel>/contentDto", function (index, context) {
					return this.addControls(context);
				}.bind(this));
				oDialog.addContent(oOuterBox);
				newDialog.open();*/
		},
		onDialogClose: function () {
			var oDialog = sap.ui.getCore().byId("idDialog");
			this._oAddAttachmentDialog.close();
			oDialog.destroy();
		},
		addDialogDetails: function () {
			var headerDto = this.getView().getModel("oDetailModel").getProperty("/dialogHeaderDto");
			var headerDetailBox = new sap.m.VBox();
			for (var i = 0; i < headerDto.length; i++) {
				headerDetailBox.addItem(
					new sap.m.Text({
						text: headerDto[i].value
					}).addStyleClass("headerDescriptionClass")
				).addStyleClass("headerContentAlignClass");
			}
			return new sap.m.VBox().addItem(
				new sap.m.HBox().addItem().addItem(headerDetailBox)
			).addStyleClass("outerHeaderBoxClass sapUiSmallMarginBegin");

		},
		addDialogControls: function (currContext) {
			var contentType = currContext.getObject().dataType;
			var newControl;
			if (contentType === "IconTabBar") {
				newControl = new sap.m.IconTabBar().addStyleClass("filterTabBarClass");
				newControl.bindAggregation("items", "oDetailModel>contentDialogDto", function (index, context) {
					var tabBarFilter = new sap.m.IconTabFilter({
						text: "{oDetailModel>label}"
					});
					tabBarFilter.bindAggregation("content", "oDetailModel>contentDialogDto", function (i, c) {
						var content = this.addControls(c);
						return content;
					}.bind(this));
					return tabBarFilter;
				}.bind(this));
			} else if (contentType.includes("Grid")) {
				var divisions = contentType.split("-").pop();
				var sDefaultSpan;
				if (divisions === "1") {
					sDefaultSpan = "L12 M12 S12";
				} else {
					sDefaultSpan = "L3 M6 S12";
				}
				newControl = new sap.ui.layout.Grid({
					defaultSpan: sDefaultSpan,
					vSpacing: 0.5
				}).addStyleClass("sapUiSizeCompact gridBackgroundClass");
				newControl.bindAggregation("content", "oDetailModel>contentDialogDto", function (i, c) {
					return this.addControls(c);
				}.bind(this));
			} else if (contentType === "Table") {
				newControl = this.createTable(new sap.ui.Table().addStyleClass("sapUiSizeCompact"), currContext);
			} else if (contentType === "Select") {
				newControl = new sap.m.Select({
					width: "100%",
					selectedKey: "{oDetailModel>value}",
					enabled: "{oDetailModel>isEditable}",
					name: "{oDetailModel>label}"
				}).addStyleClass("sapUiSizeCompact gridTextClass");
				newControl.bindItems("oDetailModel>attributeValues", function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.attributeValue,
						key: obj.attributeKey
					});
				});
			} else if (contentType === "Input") {
				newControl = new sap.m.Input({
					width: "100%",
					value: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "TextArea") {
				newControl = new sap.m.TextArea({
					width: "100%",
					id: "idDetailActionComment",
					value: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "ComboBox") {
				newControl = new sap.m.ComboBox({
					width: "100%",
					selectedKey: "{oDetailModel>value}",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
				newControl.bindItems("oDetailModel>attributeValues", function (index, context) {
					var obj = context.getObject();
					return new sap.ui.core.Item({
						text: obj.attributeValue,
						key: obj.attributeKey
					});
				});
			} else if (contentType === "Text") {
				newControl = new sap.m.Text({
					width: "100%",
					text: "{oDetailModel>value}"
				}).addStyleClass("sapUiSizeCompact gridTextContentClass");
			} else if (contentType === "Date") {
				newControl = new sap.m.DatePicker({
					width: "100%",
					value: "{oDetailModel>value}",
					placeholder: "mm/dd/yyyy",
					displayFormat: "MM/dd/yyyy",
					valueFormat: "yyyy-MM-dd",
					editable: "{oDetailModel>isEditable}"
				}).addStyleClass("sapUiSizeCompact");
			} else if (contentType === "List") {
				newControl = this.createList(new sap.m.CustomListItem().addStyleClass("sapUiSizeCompact"), currContext);
			} else {
				newControl = new sap.m.Text({
					text: "Unexpected Control!"
				});
			}
			var gridTextClass;
			if (currContext.getObject().label) {
				if (currContext.getObject().value) {
					gridTextClass = "gridTextClass";
				} else {
					if (currContext.getObject().dataType) {
						gridTextClass = "headerClass";
					}
				}

				newControl = new sap.m.VBox().addItem(new sap.m.Label({
					text: "{oDetailModel>label}"

				}).addStyleClass(gridTextClass)).addItem(newControl);
			}
			return newControl;
		},

		createList: function (oList, currContext) {
			var oItemTemplate = new sap.m.StandardListItem({
				title: "{oDetailModel>name}",
				type: sap.m.ListType.Navigation,
				description: "{oDetailModel>name}",
			}).addStyleClass("listClass");
			oList.bindAggregation("items", "oDetailModel>listDto/headers", oItemTemplate);
			return oList;
		}
	});
});