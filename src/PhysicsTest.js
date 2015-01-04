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
 	{ create:function ( ) { return new msw.LogoSmash 	( ); } },
 	{ create:function ( ) { return new msw.PyramidStack ( ); } }
];

msw.PhysicTestIndex = 0;

var BASE_TEST_MENUITEM_PREV_TAG 	= 1;
var BASE_TEST_MENUITEM_RESET_TAG	= 2;
var BASE_TEST_MENUITEM_NEXT_TAG 	= 3;

var BASE_TEST_MENU_TAG 				= 10;
var BASE_TEST_TITLE_TAG 			= 11;
var BASE_TEST_SUBTITLE_TAG 			= 12;

var	STATIC_COLOR					= cc.color ( 255, 0, 0, 255 );
var	DRAG_BODYS_TAG 					= 0x80;

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
		item1.y = height / 2;
		item2.x = SCR_W2;
		item2.y = height / 2;
		item3.x = SCR_W2 + width * 2;
		item3.y = height / 2;
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

	addGrossiniAtPosition:function ( p, scale )
	{
		if ( scale === undefined )	scale = 1.0;

		var 	posx, posy;

		posx = cc.random0To1 ( ) * 200.0;
		posy = cc.random0To1 ( ) * 200.0;

		posx = parseInt ( posx % 4 ) * 85;
		posy = parseInt ( posy % 3 ) * 121;

		var 	sp = new cc.SpriteEx ( this._spriteTexture, cc.rect ( posx, posy, 85, 121 ) );
		sp.setScale ( scale );
		sp.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( 48.0 * scale, 108.0 * scale ) ) );
		this.addChild ( sp );
		sp.setPosition ( p );

		return sp;
	}	
});

msw.PhysicTestScene.runThisTest = function ( )
{
	var		scene = msw.PhysicTest [ msw.PhysicTestIndex ].create ( );
	cc.director.runScene ( scene );	
}

/////////////////////////////////////////////
var		logo_width 		= 188;
var		logo_height 	= 35;
var		logo_row_length = 24;
var 	logo_image 		=
[
	 15,-16,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,-64,15,63,-32,-2,0,0,0,0,0,0,0,
	 0,0,0,0,0,0,0,0,0,0,0,31,-64,15,127,-125,-1,-128,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	 0,0,0,127,-64,15,127,15,-1,-64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,-1,-64,15,-2,
	 31,-1,-64,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,-1,-64,0,-4,63,-1,-32,0,0,0,0,0,0,
	 0,0,0,0,0,0,0,0,0,0,1,-1,-64,15,-8,127,-1,-32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
	 1,-1,-64,0,-8,-15,-1,-32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,-31,-1,-64,15,-8,-32,
	 -1,-32,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,7,-15,-1,-64,9,-15,-32,-1,-32,0,0,0,0,0,
	 0,0,0,0,0,0,0,0,0,0,31,-15,-1,-64,0,-15,-32,-1,-32,0,0,0,0,0,0,0,0,0,0,0,0,0,
	 0,0,63,-7,-1,-64,9,-29,-32,127,-61,-16,63,15,-61,-1,-8,31,-16,15,-8,126,7,-31,
	 -8,31,-65,-7,-1,-64,9,-29,-32,0,7,-8,127,-97,-25,-1,-2,63,-8,31,-4,-1,15,-13,
	 -4,63,-1,-3,-1,-64,9,-29,-32,0,7,-8,127,-97,-25,-1,-2,63,-8,31,-4,-1,15,-13,
	 -2,63,-1,-3,-1,-64,9,-29,-32,0,7,-8,127,-97,-25,-1,-1,63,-4,63,-4,-1,15,-13,
	 -2,63,-33,-1,-1,-32,9,-25,-32,0,7,-8,127,-97,-25,-1,-1,63,-4,63,-4,-1,15,-13,
	 -1,63,-33,-1,-1,-16,9,-25,-32,0,7,-8,127,-97,-25,-1,-1,63,-4,63,-4,-1,15,-13,
	 -1,63,-49,-1,-1,-8,9,-57,-32,0,7,-8,127,-97,-25,-8,-1,63,-2,127,-4,-1,15,-13,
	 -1,-65,-49,-1,-1,-4,9,-57,-32,0,7,-8,127,-97,-25,-8,-1,63,-2,127,-4,-1,15,-13,
	 -1,-65,-57,-1,-1,-2,9,-57,-32,0,7,-8,127,-97,-25,-8,-1,63,-2,127,-4,-1,15,-13,
	 -1,-1,-57,-1,-1,-1,9,-57,-32,0,7,-1,-1,-97,-25,-8,-1,63,-1,-1,-4,-1,15,-13,-1,
	 -1,-61,-1,-1,-1,-119,-57,-32,0,7,-1,-1,-97,-25,-8,-1,63,-1,-1,-4,-1,15,-13,-1,
	 -1,-61,-1,-1,-1,-55,-49,-32,0,7,-1,-1,-97,-25,-8,-1,63,-1,-1,-4,-1,15,-13,-1,
	 -1,-63,-1,-1,-1,-23,-49,-32,127,-57,-1,-1,-97,-25,-1,-1,63,-1,-1,-4,-1,15,-13,
	 -1,-1,-63,-1,-1,-1,-16,-49,-32,-1,-25,-1,-1,-97,-25,-1,-1,63,-33,-5,-4,-1,15,
	 -13,-1,-1,-64,-1,-9,-1,-7,-49,-32,-1,-25,-8,127,-97,-25,-1,-1,63,-33,-5,-4,-1,
	 15,-13,-1,-1,-64,-1,-13,-1,-32,-49,-32,-1,-25,-8,127,-97,-25,-1,-2,63,-49,-13,
	 -4,-1,15,-13,-1,-1,-64,127,-7,-1,-119,-17,-15,-1,-25,-8,127,-97,-25,-1,-2,63,
	 -49,-13,-4,-1,15,-13,-3,-1,-64,127,-8,-2,15,-17,-1,-1,-25,-8,127,-97,-25,-1,
	 -8,63,-49,-13,-4,-1,15,-13,-3,-1,-64,63,-4,120,0,-17,-1,-1,-25,-8,127,-97,-25,
	 -8,0,63,-57,-29,-4,-1,15,-13,-4,-1,-64,63,-4,0,15,-17,-1,-1,-25,-8,127,-97,
	 -25,-8,0,63,-57,-29,-4,-1,-1,-13,-4,-1,-64,31,-2,0,0,103,-1,-1,-57,-8,127,-97,
	 -25,-8,0,63,-57,-29,-4,-1,-1,-13,-4,127,-64,31,-2,0,15,103,-1,-1,-57,-8,127,
	 -97,-25,-8,0,63,-61,-61,-4,127,-1,-29,-4,127,-64,15,-8,0,0,55,-1,-1,-121,-8,
	 127,-97,-25,-8,0,63,-61,-61,-4,127,-1,-29,-4,63,-64,15,-32,0,0,23,-1,-2,3,-16,
	 63,15,-61,-16,0,31,-127,-127,-8,31,-1,-127,-8,31,-128,7,-128,0,0
];

msw.frand = function ( )
{
	return parseInt ( Math.random ( ) * 0xffffff );
};

msw.LogoSmash = msw.PhysicTestScene.extend 
({
	ctor:function ( ) 
	{
		this._super ( );

		this.getPhysicsWorld ( ).setGravity ( cp.v ( 0, 0 ) );
//		this.getPhysicsWorld ( ).setUpdateRate ( 5.0 );

		this._ball = new cc.SpriteBatchNode ( "res/ball.png", logo_image.length );
		this.addChild ( this._ball );		

		for ( var y = 0; y < logo_height; ++y )
		{
			for ( var x = 0; x < logo_width; ++x )
			{
				if ( this.get_pixel ( x, y ) )
				{									
					var 	x_jitter = 0.05 * cc.random0To1 ( );
					var 	y_jitter = 0.05 * cc.random0To1 ( );

					var 	ball = this.makeBall 
					(
							cp.v ( 2 * ( x - logo_width / 2 + x_jitter ) + SCR_W2, 2 * ( logo_height-y + y_jitter ) + SCR_H2 - logo_height / 2 ),
							0.95, cc.PhysicsMaterial ( 0.01, 0.0, 0.0 ) 
					);

					ball.getPhysicsBody ( ).setMass ( 1.0 );
					ball.getPhysicsBody ( ).setMoment ( cc.PHYSICS_INFINITY );

//					this._ball.addChild ( ball );
					this.addChild ( ball );
				}
			}
		}

		var 	bullet = this.makeBall ( cp.v ( 400, 0 ), 10, cc.PhysicsMaterial ( cc.PHYSICS_INFINITY, 0, 0 ) );
		bullet.getPhysicsBody ( ).setVelocity ( cp.v ( 200, 0 ) );	   
		bullet.setPosition ( cp.v ( -500, SCR_H2 ) );	    
//		this._ball.addChild ( bullet );
		this.addChild ( bullet );	 
	},

	getTitle:function ( )
	{
		return "Logo Smash";
	},	

	get_pixel:function ( x, y )
	{
		return ( logo_image [ ( x >> 3 ) + y * logo_row_length ] >> ( ~x & 0x7 ) ) & 1;
	},

	makeBall:function ( point, radius, material )
	{
		var 	ball = new cc.SpriteEx ( this._ball.texture );
		var 	body = cc.PhysicsBody.createCircle ( radius, material );		

		ball.setScale ( 0.13 * radius );
		ball.setPhysicsBody ( body );				
		ball.setPosition ( point );

		return ball;
	}	
});

/////////////////////////////////////////////
msw.PyramidStack = msw.PhysicTestScene.extend 
({
	ctor:function ( ) 
	{
		this._super ( );
		
		var 	node = new cc.NodeEx ( );
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeSegment ( cp.v ( 0, 50 ), cp.v ( SCR_W, 50 ) ) );
		this.addChild ( node );

		var 	ball = new cc.SpriteEx ( "res/ball.png" );
		ball.setScale ( 1 );
		ball.setTag ( 100 );
		ball.setPhysicsBody ( cc.PhysicsBody.createCircle ( 10 ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		ball.setPosition ( cp.v ( SCR_W2, 60 ) );
		this.addChild ( ball, 0, 100 );

		for ( var i = 0; i < 14; i++ )
		{
			for ( var j = 0; j <= i; j++ )
			{
				var 	sp = this.addGrossiniAtPosition (  cp.v ( SCR_W2 + ( i / 2 - j ) * 11, ( 14 - i ) * 23 + 100 ), 0.2 );
				sp.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
			}
		}		
		
		this.scheduleOnce ( this.updateOnce, 3.0 );
	},
	
	getTitle:function ( )
	{
		return "Pyramid Stack";
	},		
	
	updateOnce:function ( )
	{
		var 	ball = this.getChildByTag ( 100 );

		ball.setScale ( ball.getScale ( ) * 3 );
		ball.setPhysicsBody ( cc.PhysicsBody.createCircle ( 30 ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	},
});
