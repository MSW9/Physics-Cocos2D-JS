/****************************************************************************
 Copyright (c) 2015 Young-Hwan Mun (yh.msw9@gmail.com, http://msw9.com) 
 Copyright (c) 2013 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

msw.PhysicTest = 
[
 	{ create:function ( ) { return new msw.LogoSmash ( ); } }
];

msw.PhysicTestIndex = 0;

var BASE_TEST_MENUITEM_PREV_TAG 	= 1;
var BASE_TEST_MENUITEM_RESET_TAG	= 2;
var BASE_TEST_MENUITEM_NEXT_TAG 	= 3;

var BASE_TEST_MENU_TAG 				= 10;
var BASE_TEST_TITLE_TAG 			= 11;
var BASE_TEST_SUBTITLE_TAG 			= 12;

msw.PhysicTestScene = cc.SceneEx.extend 
({
	ctor:function ( ) 
	{		
		this._super ( );
		
		this._debugDraw = false;
		this._spriteTexture = new cc.SpriteBatchNode ( "res/grossini_dance_atlas.png", 100 ).getTexture ( );

		var 	label = new cc.LabelTTF ( this.getTitle ( ), "Arial", 28 );
		this.addChild ( label, 100, BASE_TEST_TITLE_TAG );
		label.x = SCR_W2;
		label.y = SCR_H - 50;

		var 	label = new cc.LabelTTF ( this.getSubTitle ( ), "Thonburi", 16 );
		this.addChild ( label, 101, BASE_TEST_SUBTITLE_TAG );
		label.x = SCR_W2;
		label.y = SCR_H - 80;		
		
		cc.MenuItemFont.setFontSize ( 18 );
		
		var 	item1 = new cc.MenuItemImage ( "res/b1.png", "res/b2.png", this.onBackCallback   , this );
		var 	item2 = new cc.MenuItemImage ( "res/r1.png", "res/r2.png", this.onRestartCallback, this );
		var 	item3 = new cc.MenuItemImage ( "res/f1.png", "res/f2.png", this.onNextCallback   , this );		
		var		item4 = new cc.MenuItemFont  ( "Toggle debug", this.toggleDebug, this );
		
		item1.tag = BASE_TEST_MENUITEM_PREV_TAG;
		item2.tag = BASE_TEST_MENUITEM_RESET_TAG;
		item3.tag = BASE_TEST_MENUITEM_NEXT_TAG;

		var 	menu = new cc.Menu ( item1, item2, item3, item4 );
		
		menu.x = 0;
		menu.y = 0;
		
		var 	width = item2.width, height = item2.height;
		item1.x = SCR_W2 - width * 2;
		item1.y = height;
		item2.x = SCR_W2;
		item2.y = height;
		item3.x = SCR_W2 + width * 2;
		item3.y = height;
		item4.x = SCR_W - 80;
		item4.y = SCR_H - 20;
		
		this.addChild ( menu, 102, BASE_TEST_MENU_TAG );
	},
	
	getTitle:function ( )
	{
		return "PhysicsTest";
	},
	
	getSubTitle:function ( )
	{
		return "";
	},
	
	onRestartCallback:function ( sender )
	{
		msw.PhysicTestScene.runThisTest ( );
	},
	
	onNextCallback:function ( sender ) 
	{
		msw.PhysicTestIndex++;
		msw.PhysicTestIndex = msw.PhysicTestIndex % msw.PhysicTest.length;
		msw.PhysicTestScene.runThisTest ( );
	},
	
	onBackCallback:function ( sender )
	{
		msw.PhysicTestIndex = ( msw.PhysicTestIndex == 0 ? msw.PhysicTest.length : msw.PhysicTestIndex ) - 1;		
		msw.PhysicTestScene.runThisTest ( );
	},	
	
	toggleDebug:function ( sender )
	{
	    this._debugDraw = !this._debugDraw;
	    this.getPhysicsWorld ( ).setDebugDrawMask ( this._debugDraw ? cc.PhysicsWorld.DEBUGDRAW_ALL : cc.PhysicsWorld.DEBUGDRAW_NONE );
	},
});

msw.PhysicTestScene.runThisTest = function ( )
{
	var		scene = msw.PhysicTest [ msw.PhysicTestIndex ].create ( );
	cc.director.runScene ( scene );	
}
