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

var physicsTestSceneIdx = -1;

var PhysicsTestScene = cc.Scene.extend 
({
	ctor:function ( )
	{
		this._super ( );		
				
		this.initWithPhysics ( );		
	},
	
	runThisTest:function ( num )
	{	
		physicsTestSceneIdx = ( num || num == 0 ) ? ( num - 1 ) : -1;
		
		var 	layer = nextPhysicsTest ( );
		this.addChild ( layer );
		cc.director.runScene ( this );		
	}
});

var BASE_TEST_MENUITEM_PREV_TAG 	= 1;
var BASE_TEST_MENUITEM_RESET_TAG 	= 2;
var BASE_TEST_MENUITEM_NEXT_TAG 	= 3;

var BASE_TEST_MENU_TAG 				= 10;
var BASE_TEST_TITLE_TAG 			= 11;
var BASE_TEST_SUBTITLE_TAG 			= 12;

var	STATIC_COLOR					= cc.color ( 255, 0, 0, 255 );
var	DRAG_BODYS_TAG 					= 0x80;

var PhysicsBaseLayer = cc.LayerGradient.extend 
({
	ctor:function ( )
	{
		this._super ( cc.color ( 0, 0, 0, 255 ), cc.color ( 98 * 0.5, 99 * 0.5, 117 * 0.5, 255 ) );	
		
		this._title 	= "PhysicsTest";
		this._subtitle 	= "";
		this._ball		= null;
		this._mouses	= new Array ( );
	},
	
	getTitle:function ( )
	{
		var t = "";
		// some tests use "this.title()" and others use "this._title";
		if ( 'title' in this )
			t = this.title ( );
		else if ( '_title' in this || this._title )
			t = this._title;
		return t;
	},
	
	getSubtitle:function ( )
	{
		var st = "";
		// some tests use "this.subtitle()" and others use "this._subtitle";
		if ( this.subtitle )
			st = this.subtitle ( );
		else if ( this._subtitle )
			st = this._subtitle;

		return st;
	},
	
	onEnter:function ( )
	{
		this._super ( );

		var 	t = this.getTitle ( );
		var 	label = new cc.LabelTTF ( t, "Arial", 28 );
		this.addChild ( label, 100, BASE_TEST_TITLE_TAG );		
		label.setPosition ( VisibleRect.center ( ).x, VisibleRect.top ( ).y - 20 );

		var 	st = this.getSubtitle ( );
		if ( st ) 
		{
			var 	l = new cc.LabelTTF ( st.toString(), "Thonburi", 16 );
			this.addChild ( l, 101, BASE_TEST_SUBTITLE_TAG );
			l.setPosition ( VisibleRect.center ( ).x, VisibleRect.top ( ).y - 50 );
		}

		var 	item1 = new cc.MenuItemImage ( "res/Images/b1.png", "res/Images/b2.png", this.onBackCallback	, this );
		var 	item2 = new cc.MenuItemImage ( "res/Images/r1.png", "res/Images/r2.png", this.onRestartCallback	, this );
		var 	item3 = new cc.MenuItemImage ( "res/Images/f1.png", "res/Images/f2.png", this.onNextCallback	, this );

		item1.setTag ( BASE_TEST_MENUITEM_PREV_TAG  );
		item2.setTag ( BASE_TEST_MENUITEM_RESET_TAG );
		item3.setTag ( BASE_TEST_MENUITEM_NEXT_TAG  );
		item1.setPosition ( VisibleRect.center ( ).x - item2.getContentSize ( ).width * 2, VisibleRect.bottom ( ).y + item1.getContentSize ( ).height / 2 );
		item2.setPosition ( VisibleRect.center ( ).x                                     , VisibleRect.bottom ( ).y + item2.getContentSize ( ).height / 2 );
		item3.setPosition ( VisibleRect.center ( ).x + item2.getContentSize ( ).width * 2, VisibleRect.bottom ( ).y + item3.getContentSize ( ).height / 2 );

		var		menu = new cc.Menu ( item1, item2, item3 );
		menu.setPosition ( 0, 0 );
		this.addChild ( menu, 102, BASE_TEST_MENU_TAG );
		
		/////////////////////////////////
		this._scene = this.getParent ( );
		this._spriteTexture = new cc.SpriteBatchNode ( "res/Images/grossini_dance_atlas.png", 100 ).getTexture ( );

		this._debugDraw = false;

		// Menu to toggle debug physics on / off
		var 	item = new cc.MenuItemFont ( "Physics On/Off", this.onToggleDebug, this );
		item.setFontSize ( 24 );
		var 	menu = new cc.Menu ( item );
		menu.setPosition ( VisibleRect.right ( ).x - 100, VisibleRect.top ( ).y - 80 );
		this.addChild ( menu, 102 );				
	},
	
	onTouchBegan:function ( touch, event )
	{
		var 	location = touch.getLocation ( );
		var 	arr = this._scene.getPhysicsWorld ( ).getShapes ( location );

		var 	body = null;
		for ( var idx in arr )
		{
			var		obj = arr [ idx ];
			if ( ( obj.getBody ( ).getTag ( ) & DRAG_BODYS_TAG ) != 0 )
			{
				body = obj.getBody ( );
				break;
			}
		}

		if ( body != null )
		{
			var 	mouse = new cc.Node ( );
			mouse.setPhysicsBody ( cc.PhysicsBody.create ( cc.PHYSICS_INFINITY, cc.PHYSICS_INFINITY ) );
			mouse.getPhysicsBody ( ).setDynamic ( false );
			mouse.setPosition ( location );
//			this.addChild ( mouse );
			this.addChildEx ( mouse );
						
			var 	joint = cc.PhysicsJointPin.create ( mouse.getPhysicsBody ( ), body, location );
			joint.setMaxForce ( 5000.0 * body.getMass ( ) );
			this._scene.getPhysicsWorld ( ).addJoint ( joint );
			this._mouses.push ( { first : touch.getID ( ), second : mouse } );

			return true;
		}
		
		return false;
	},
	
	onTouchMoved:function ( touch, event )
	{
		for ( var i = 0; i < this._mouses.length; i++ )
		{
			if ( this._mouses [ i ].first == touch.getID ( ) )
			{
				this._mouses [ i ].second.setPosition ( touch.getLocation ( ) );
			}
		}
	},
	
	onTouchEnded:function ( touch, event )
	{
		for ( var i = 0; i < this._mouses.length; i++ )
		{
			if ( this._mouses [ i ].first == touch.getID ( ) )
			{
//				this.removeChild ( this._mouses [ i ].second );
				this.removeChildEx ( this._mouses [ i ].second );
				this._mouses.splice ( i, 1 );
				i--;
			}
		}
	},	
	
	onCleanup:function ( ) 
	{
		// Not compulsory, but recommended: cleanup the scene
		this.unscheduleUpdate ( );
	},
	
	onRestartCallback:function ( sender )
	{
		this.onCleanup ( );
		
		var 	s = new PhysicsTestScene ( );
		s.addChild ( restartPhysicsTest ( ) );
		cc.director.runScene ( s );
	},
	
	onNextCallback:function ( sender ) 
	{
		this.onCleanup ( );

		var 	s = new PhysicsTestScene ( );
		s.addChild ( nextPhysicsTest ( ) );
		cc.director.runScene ( s );
	},
	
	onBackCallback:function ( sender )
	{
		this.onCleanup ( );

		var 	s = new PhysicsTestScene ( );
		s.addChild ( previousPhysicsTest ( ) );
		cc.director.runScene ( s );
	},	
	
	onToggleDebug:function ( sender )
	{
		this._debugDraw = !this._debugDraw;
		this._scene.getPhysicsWorld ( ).setDebugDrawMask ( this._debugDraw ? cc.PhysicsWorld.DEBUGDRAW_ALL : cc.PhysicsWorld.DEBUGDRAW_NONE );
	},
	
	makeBall:function ( point, radius, material )
	{
		var 	ball = null;
		if ( this._ball )
		{
			ball = new cc.Sprite ( this._ball.texture );
		}
		else
		{
			ball = new cc.Sprite ( "res/Images/ball.png" );
		}
				
		var 	body = cc.PhysicsBody.createCircle ( radius, material );		

		ball.setScale ( 0.13 * radius );
		ball.setPhysicsBody ( body );				
		ball.setPosition ( point );

		return ball;
	},
	
	makeBox:function ( point, size, color, material )
	{
		var 	yellow = false;
		
		if ( color == 0 )
		{
			yellow = cc.random0To1 ( ) > 0.5;
		}
		else
		{
			yellow = color == 1;
		}

		var 	box = yellow ? new cc.Sprite ( "res/Images/YellowSquare.png" ) : new cc.Sprite ( "res/Images/YellowSquare.png" );
		box.setScaleX ( size.width  / 100.0 );
		box.setScaleY ( size.height / 100.0 );

		var 	body = cc.PhysicsBody.createBox ( size, material );
		box.setPhysicsBody ( body );
		box.setPosition ( point );

		return box;
		
	},
	
	makeTriangle:function ( point, size, color, material )
	{
		var 	yellow = false;

		if ( color == 0 )
		{
			yellow = cc.random0To1 ( ) > 0.5;
		}
		else
		{
			yellow = color == 1;
		}

		var 	triangle = yellow ? new cc.Sprite ( "res/Images/YellowTriangle.png" ) : new cc.Sprite ( "res/Images/CyanTriangle.png" );
		
		if ( size.height == 0 )
		{
			triangle.setScale ( size.width / 100.0 );
		}
		else
		{
			triangle.setScaleX ( size.width  / 100.0 );
			triangle.setScaleY ( size.height / 87.0 );
		}
		
		var 	vers = 
		[
		 	              0,  size.height / 2, 
		 	 size.width / 2, -size.height / 2,
		 	-size.width / 2, -size.height / 2 
		];

		var 	body = cc.PhysicsBody.createPolygon ( vers, material );
		triangle.setPhysicsBody ( body );
		triangle.setPosition ( point );

		return triangle;		
	},
	
	addGrossiniAtPosition:function ( p, scale )
	{
		if ( scale === undefined )	scale = 1.0;

		var 	posx, posy;

		posx = cc.random0To1 ( ) * 200.0;
		posy = cc.random0To1 ( ) * 200.0;

		posx = parseInt ( posx % 4 ) * 85;
		posy = parseInt ( posy % 3 ) * 121;

		var 	sp = new cc.Sprite ( this._spriteTexture, cc.rect ( posx, posy, 85, 121 ) );
		sp.setScale ( scale );
		sp.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( 48.0 * scale, 108.0 * scale ) ) );
//		this.addChild ( sp );
		this.addChildEx ( sp );
		sp.setPosition ( p );

		return sp;
	}	
});

////////////////////////////////
PhysicsDemoLogoSmash = ( function ( ) 
{
	var 	logo_width  	= 188;
	var 	logo_height  	= 35;
	var 	logo_row_length = 24;

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

	var 	get_pixel = function ( x, y )
	{
		return ( logo_image [ ( x >> 3 ) + y * logo_row_length ] >> ( ~x & 0x7 ) ) & 1;
	};
	
	return PhysicsBaseLayer.extend
	({
		ctor:function ( )
		{
			this._super ( );
			
			this._title = "LogoSmash";		
		},
		
		onEnter:function ( )
		{
			this._super ( );
			
			this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );
//			this._scene.getPhysicsWorld ( ).setUpdateRate ( 5.0 );

			this._ball = new cc.SpriteBatchNode ( "res/Images/ball.png", logo_image.length );
			this.addChild ( this._ball );		

			for ( var y = 0; y < logo_height; ++y )
			{
				for ( var x = 0; x < logo_width; ++x )
				{
					if ( get_pixel ( x, y ) )
					{									
						var 	x_jitter = 0.05 * cc.random0To1 ( );
						var 	y_jitter = 0.05 * cc.random0To1 ( );

						var 	ball = this.makeBall
						(
							cc.p 
							( 
								2 * ( x - logo_width / 2 + x_jitter ) + VisibleRect.center ( ).x,
								2 * ( logo_height-y + y_jitter ) + VisibleRect.center ( ).y - logo_height / 2
							),
							0.95, cc.PhysicsMaterial ( 0.01, 0.0, 0.0 ) 
						);

						ball.getPhysicsBody ( ).setMass ( 1.0 );
						ball.getPhysicsBody ( ).setMoment ( cc.PHYSICS_INFINITY );

//						this._ball.addChild ( ball );
//						this._ball.addChildEx ( ball );
						this._scene.addChild ( ball );
					}
				}
			}
			
			var 	bullet = this.makeBall ( cp.v ( 400, 0 ), 10, cc.PhysicsMaterial ( cc.PHYSICS_INFINITY, 0, 0 ) );
			bullet.getPhysicsBody ( ).setVelocity ( cp.v ( 200, 0 ) );	   
			bullet.setPosition ( cp.v ( -500, VisibleRect.center ( ).y ) );	    
//			this._ball.addChild ( bullet );
//			this._ball.addChildEx ( bullet );	
			this._scene.addChild ( bullet );
		},		
	});
}) ( );


PhysicsDemoPyramidStack = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Pyramid Stack";		
	},

	onEnter:function ( )
	{
		this._super ( );

		var 	node = new cc.Node ( );
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeSegment ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 0, 50 ) ), cp.v.add ( VisibleRect.rightBottom ( ), cp.v ( 0, 50 ) ) ) );
//		this.addChild ( node );
		this.addChildEx ( node );

		var 	ball = new cc.Sprite ( "res/Images/ball.png" );
		ball.setScale ( 1 );
		ball.setTag ( 100 );
		ball.setPhysicsBody ( cc.PhysicsBody.createCircle ( 10 ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		ball.setPosition ( cp.v.add ( VisibleRect.bottom ( ), cp.v ( 0, 60 ) ) );
//		this.addChild ( ball, 0, 100 );		
		this.addChildEx ( ball, 0, 100 );
		
		for ( var i = 0; i < 14; i++ )
		{
			for ( var j = 0; j <= i; j++ )
			{
				var 	sp = this.addGrossiniAtPosition 
				( 
					cp.v.add ( VisibleRect.bottom ( ), cp.v ( ( i / 2 - j ) * 11, ( 14 - i ) * 23 + 100 ) ), 0.2 
				);
				sp.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
			}
		}		

		this.scheduleOnce ( this.updateOnce, 3.0 );				
	},		
	
	updateOnce:function ( )
	{
		var 	ball = this.getChildByTag ( 100 );

		ball.setScale ( ball.getScale ( ) * 3 );
		ball.setPhysicsBody ( cc.PhysicsBody.createCircle ( 30 ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	},	
});

/////////////////////////////////////////////
PhysicsDemoClickAdd = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._subtitle = "multi touch to add grossini";		
	},
	
	onEnter:function ( ) 
	{
		this._super ( );

		var 	node = new cc.Node ( );
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ) ) );
		node.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( node );
		this.addChildEx ( node );

		this.addGrossiniAtPosition ( VisibleRect.center ( ) );

		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesEnded : this.onTouchesEnded.bind ( this )
		}, this );		    
	},

	onTouchesEnded:function ( touches, event )
	{
		for ( var idx in touches )
		{
			var		touch = touches [ idx ];
			var 	location = touch.getLocation ( );

			this.addGrossiniAtPosition ( location );
		}
	},
});

/////////////////////////////////////////////
PhysicsDemoRayCast = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Ray Cast";		
	},
	
	onEnter:function ( ) 
	{
		this._super ( );
		
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );
		
		this._mode  = 0;
		this._angle = 0;
		this._node  = new cc.DrawNode ( );
		this.addChild ( this._node, 1 );
		
		var 	node = new cc.DrawNode ( );
		var		line = { s : cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 0, 50 ) ), e : cp.v.add ( VisibleRect.rightBottom ( ), cp.v ( 0, 50 ) ) };
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeSegment ( line.s, line.e ) );			
		//node->drawSegment(VisibleRect.leftBottom ( ) + cp.v ( 0, 50 ), VisibleRect.rightBottom ( ) + cp.v ( 0, 50 ), 1, STATIC_COLOR);
		node.drawSegment ( line.s, line.e, 1, STATIC_COLOR );
//		this.addChild ( node );
		this.addChildEx ( node );
		
		cc.MenuItemFont.setFontSize ( 18 );
		var 	item = new cc.MenuItemFont ( "Change Mode(any)", this.changeModeCallback, this );		
		var 	menu = new cc.Menu ( item );
		menu.setPosition ( VisibleRect.left ( ).x + 100, VisibleRect.top ( ).y - 50 );
		this.addChild ( menu );
		
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ALL_AT_ONCE,
			onTouchesEnded : this.onTouchesEnded.bind ( this )
		}, this );		    
		
		this.scheduleUpdate ( );
	},

	getTitle:function ( )
	{
		return "Ray Cast";
	},		

	changeModeCallback:function ( sender )
	{
		this._mode = ( this._mode + 1 ) % 3;

		switch ( this._mode )
		{
			case 0 :	sender.setString ( "Change Mode(any)" );		break;
			case 1 :	sender.setString ( "Change Mode(nearest)" );	break;
			case 2 :	sender.setString ( "Change Mode(multiple)" );	break;
		}
	},
	
	onTouchesEnded:function ( touches, event )
	{
		// Add a new body/atlas sprite at the touched location
		for ( var idx in touches )
		{
			var		touch = touches [ idx ];
			var 	location = touch.getLocation ( );

			var 	r = cc.random0To1 ( );
			var		obj = null; 
			
			if ( r < 1.0 / 3.0 )
			{
				obj = this.makeBall ( location, 5 + cc.random0To1 ( ) * 10 );
			}
			else if ( r < 2.0 / 3.0 )
			{
				obj = this.makeBox ( location, cc.size ( 10 + cc.random0To1 ( ) * 15, 10 + cc.random0To1 ( ) * 15 ) );
			}
			else
			{
				obj = this.makeTriangle ( location, cc.size ( 10 + cc.random0To1 ( ) * 20, 10 + cc.random0To1 ( ) * 20 ) );
			}		
			
//			this.addChild ( obj );
			this.addChildEx ( obj );
		}
	},
	
	anyRay:function ( world, info, data )
	{
		data.x = info.contact.x;	
		data.y = info.contact.y;	
		return false;
	},

	update:function ( delta )
	{
		this._super ( delta );

		var 	L = 150.0;
		var 	point1 = VisibleRect.center ( );
		var 	d = cp.v ( L * Math.cos ( this._angle ), L * Math.sin ( this._angle ) );
		var 	point2 = cp.v.add ( point1, d );

		this._node.clear ( );
		
		switch ( this._mode )
		{
			case 0 :
				
				var 	point3 = cp.v ( point2.x, point2.y );	
				this._scene.getPhysicsWorld ( ).rayCast ( this.anyRay, point1, point2, point3 );
				this._node.drawSegment ( point1, point3, 1, STATIC_COLOR );
	
				if ( !cp.v.eql ( point2, point3 ) )
				{
					this._node.drawDot ( point3, 2, cc.color ( 255, 255, 255, 255 ) );
				}				
				
				break;
		
			case 1 :
	
				var 	point3 = cp.v ( point2.x, point2.y );	
				var 	friction = 1.0;
				
				var		func = function ( world, info, data )
				{
					if ( friction > info.fraction )
					{
						point3 = info.contact;						
						friction = info.fraction;
					}
					
					return true;
				};
	
				this._scene.getPhysicsWorld ( ).rayCast ( func, point1, point2, null );
				this._node.drawSegment ( point1, point3, 1, STATIC_COLOR );
	
				if ( !cp.v.eql ( point2, point3 ) )
				{
					this._node.drawDot ( point3, 2, cc.color ( 255, 255, 255, 255 ) );
				}	
				
				break;
		
			case 2 :

				var 	MAX_MULTI_RAYCAST_NUM = 5
				var 	points = new Array ( MAX_MULTI_RAYCAST_NUM );
				var 	num = 0;
	
				var		func = function ( world, info, data )
				{
					if ( num < MAX_MULTI_RAYCAST_NUM )
					{
						points [ num++ ] = info.contact;						
					}
					
					return true;
				};
				
				this._scene.getPhysicsWorld ( ).rayCast ( func, point1, point2, null );
				this._node.drawSegment ( point1, point2, 1, STATIC_COLOR );
	
				for ( var i = 0; i < num; ++i )
				{
					this._node.drawDot ( points [ i ], 2, cc.color ( 255, 255, 255, 255 ) );
				}
	
				break;		
		}

		this._angle += 0.25 * Math.PI / 180.0;
	}
});

/////////////////////////////////////////////
PhysicsDemoJoints = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Joints";		
	},

	onEnter:function ( ) 
	{
		this._super ( );

		this.onToggleDebug ( );
		
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );	

		var 	width  = ( VisibleRect.getVisibleRect ( ).width  - 10 ) / 4;
		var 	height = ( VisibleRect.getVisibleRect ( ).height - 50 ) / 4;

		var 	node = new cc.Node ( );
		var 	box  = cc.PhysicsBody.create ( );
		node.setPhysicsBody ( box );
		box.setDynamic ( false );
		node.setPosition ( cp.vzero );
//		this.addChild ( node );
		this.addChildEx ( node );

		for ( var i = 0; i < 4; ++i )
		{
			for ( var j = 0; j < 4; ++j )
			{				
				var 	offset = cc.p ( VisibleRect.leftBottom ( ).x + 5 + j * width + width / 2, VisibleRect.leftBottom ( ).y + 50 + i * height + height / 2 );
				box.addShape ( cc.PhysicsShapeEdgeBox.create ( cc.size ( width, height ), cc.PHYSICSSHAPE_MATERIAL_DEFAULT, 1, offset ) );

				switch ( i * 4 + j )
				{
					case 0 :
					{
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBall ( cp.v.add ( offset, cp.v ( 30, 0 ) ), 10 );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var		joint = cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), offset );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
					
					case 1 :
					{
	
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var 	joint = cc.PhysicsJointFixed.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), offset );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
		
					case 2 :
					{
	
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var 	joint = cc.PhysicsJointDistance.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), cp.vzero, cp.vzero );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 3 :
					{
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var 	joint = cc.PhysicsJointLimit.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), cp.vzero, cp.vzero, 30.0, 60.0 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
					
					case 4 :
					{
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var 	joint = cc.PhysicsJointSpring.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), cp.vzero, cp.vzero, 500.0, 0.3 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 5 :
					{
						var 	sp1 = this.makeBall ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), 10 );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						var 	joint = cc.PhysicsJointGroove.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), cp.v ( 30, 15 ), cp.v ( 30, -15 ), cp.v ( -30, 0 ) );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 6 :
					{
						var 	sp1 = this.makeBox ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), box, sp1.getPosition ( ) ) );
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp2.getPhysicsBody ( ), box, sp2.getPosition ( ) ) );
						var 	joint = cc.PhysicsJointRotarySpring.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), 3000.0, 60.0 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
					
					case 7 :
					{
						var 	sp1 = this.makeBox ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), box, sp1.getPosition ( ) ) );
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp2.getPhysicsBody ( ), box, sp2.getPosition ( ) ) );
						var 	joint = cc.PhysicsJointRotaryLimit.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), 0.0, Math.PI * 2 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 8 :
					{
						var 	sp1 = this.makeBox ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), box, sp1.getPosition ( ) ) );
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp2.getPhysicsBody ( ), box, sp2.getPosition ( ) ) );
						var 	joint = cc.PhysicsJointRatchet.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), 0.0, Math.PI * 2 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 9 :
					{
						var 	sp1 = this.makeBox ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), box, sp1.getPosition ( ) ) );
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp2.getPhysicsBody ( ), box, sp2.getPosition ( ) ) );
						var	 	joint = cc.PhysicsJointGear.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), 0.0, 2.0 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
				
					case 10 :
					{
						var 	sp1 = this.makeBox ( cp.v.sub ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
						var 	sp2 = this.makeBox ( cp.v.add ( offset, cp.v ( 30, 0 ) ), cc.size ( 30, 10 ) );
						sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
	
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp1.getPhysicsBody ( ), box, sp1.getPosition ( ) ) );
						this._scene.getPhysicsWorld ( ).addJoint ( cc.PhysicsJointPin.create ( sp2.getPhysicsBody ( ), box, sp2.getPosition ( ) ) );
						var 	joint = cc.PhysicsJointMotor.create ( sp1.getPhysicsBody ( ), sp2.getPhysicsBody ( ), Math.PI * 2 );
						this._scene.getPhysicsWorld ( ).addJoint ( joint );
	
						this.addChildEx ( sp1 );
						this.addChildEx ( sp2 );
						break;
					}
					
				}				 
			}
		}
	}
});

/////////////////////////////////////////////
PhysicsDemoActions = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Actions";		
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );

		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );	

		var 	node = new cc.Node ( );
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ) ) );
		node.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( node );
		this.addChildEx ( node );

		var 	sp1 = this.addGrossiniAtPosition ( VisibleRect.center ( ) );
		var	 	sp2 = this.addGrossiniAtPosition ( cp.v.add ( VisibleRect.left    ( ), cp.v ( 50,   0 ) ) );
		var 	sp3 = this.addGrossiniAtPosition ( cp.v.sub ( VisibleRect.right   ( ), cp.v ( 20,   0 ) ) );
		var	 	sp4 = this.addGrossiniAtPosition ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 50, -50 ) ) );
		
		sp4.getPhysicsBody ( ).setGravityEnable ( false );

		sp1.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		sp2.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		sp3.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		sp4.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );

		var 	actionTo 	 = cc.jumpTo ( 2, cc.p ( 100, 100 ), 50, 4 );
		var 	actionBy 	 = cc.jumpBy ( 2, cc.p ( 300,   0 ), 50, 4 );
		var 	actionUp 	 = cc.jumpBy ( 2, cc.p (   0,  50 ), 80, 4 );
		var 	actionByBack = actionBy.reverse ( );
		var 	rotateBy 	 = cc.rotateBy ( 2,  180 );
		var 	rotateByBack = cc.rotateBy ( 2, -180 );

		sp1.runAction ( actionUp.repeatForever ( ) );
		sp2.runAction ( cc.sequence ( actionBy, actionByBack ).repeatForever ( ) );
		sp3.runAction ( actionTo );
		sp4.runAction ( cc.sequence ( rotateBy, rotateByBack ).repeatForever ( ) );		
	}
});

/////////////////////////////////////////////
PhysicsDemoPump = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Pump";	
		this._subtitle = "touch screen on left or right";	
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
	
		this.onToggleDebug ( );

		this._distance  = 0.0;
		this._rotationV = 0.0;
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );
		this.scheduleUpdate ( );

		
		var 	node = new cc.Node ( );
		var 	body = cc.PhysicsBody.create ( );
		body.setDynamic ( false );

		var 	staticMaterial = cc.PhysicsMaterial ( cc.PHYSICS_INFINITY, 0, 0.5 );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v (  50,    0 ) ), cp.v.add ( VisibleRect.leftTop	( ), cp.v (   50, -130 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 190,    0 ) ), cp.v.add ( VisibleRect.leftTop	( ), cp.v (  100, - 50 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 100, - 50 ) ), cp.v.add ( VisibleRect.leftTop	( ), cp.v (  100, - 90 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v (  50, -130 ) ), cp.v.add ( VisibleRect.leftTop    ( ), cp.v (  100, -145 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 100, -145 ) ), cp.v.add ( VisibleRect.leftBottom ( ), cp.v (  100,   80 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 150, - 80 ) ), cp.v.add ( VisibleRect.leftBottom ( ), cp.v (  150,   80 ) ), staticMaterial, 2.0 ) );
		body.addShape ( cc.PhysicsShapeEdgeSegment.create ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 150, - 80 ) ), cp.v.add ( VisibleRect.rightTop   ( ), cp.v ( -100, -150 ) ), staticMaterial, 2.0 ) );

		body.setCategoryBitmask ( 0x01 );

		// balls
		for ( var i = 0; i < 6; ++i )
		{
			var 	ball = this.makeBall ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 75 + cc.random0To1 ( ) * 90, 0 ) ), 22, cc.PhysicsMaterial ( 0.05, 0.0, 0.1 ) );
			ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//			this.addChild ( ball );
			this.addChildEx ( ball );
		}

		node.setPhysicsBody ( body );
//		this.addChild ( node );
		this.addChildEx ( node );
		
		var 	vec =
		[
			cp.v.add ( VisibleRect.leftTop	  ( ), cp.v ( 102, -148 ) ),
			cp.v.add ( VisibleRect.leftTop	  ( ), cp.v ( 148, -161 ) ),
			cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 148,   20 ) ),
			cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 102,   20 ) )
		];

		var 	_world = this._scene.getPhysicsWorld ( );

		// small gear
		var 	sgear = new cc.Node ( );
		var 	sgearB = cc.PhysicsBody.createCircle ( 44 );
		sgear.setPhysicsBody ( sgearB );
		sgear.setPosition ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 125, 0 ) ) );
//		this.addChild ( sgear );
		this.addChildEx ( sgear );
		sgearB.setCategoryBitmask  ( 0x04 );
		sgearB.setCollisionBitmask ( 0x04 );
		sgearB.setTag ( 1 );
		_world.addJoint ( cc.PhysicsJointPin.create ( body, sgearB, sgearB.getPosition ( ) ) );

		// big gear
		var 	bgear = new cc.Node ( );
		var 	bgearB = cc.PhysicsBody.createCircle ( 100 );
		bgear.setPhysicsBody ( bgearB );
		bgear.setPosition ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 275, 0 ) ) );
//		this.addChild ( bgear );
		this.addChildEx ( bgear );
		bgearB.setCategoryBitmask ( 0x04 );
		_world.addJoint ( cc.PhysicsJointPin.create ( body, bgearB, bgearB.getPosition ( ) ) );
		
		// pump
		var 	pump = new cc.Node ( );
		var 	center = cc.PhysicsShape.getPolyonCenter ( vec, 4 );		
		pump.setPosition ( center );
		var 	pumpB = cc.PhysicsBody.createPolygon ( vec, cc.PHYSICSBODY_MATERIAL_DEFAULT, cp.v.neg ( center ) );
		pump.setPhysicsBody ( pumpB );
//		this.addChild ( pump );
		this.addChildEx ( pump );
		
		pumpB.setCategoryBitmask ( 0x02 );
		pumpB.setGravityEnable ( false );
		_world.addJoint ( cc.PhysicsJointDistance.create ( pumpB, sgearB, cp.v ( 0, 0 ), cp.v ( 0, -44 ) ) );
		
		// plugger
		var 	seg = [ cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 75, -120 ) ), cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 75, -100 ) ) ];
		var 	segCenter = cp.v.mult ( cp.v.add ( seg [ 1 ], seg [ 0 ] ), 0.5 );
		seg [ 1 ] = cp.v.sub ( seg [ 1 ], segCenter );
		seg [ 0 ] = cp.v.sub ( seg [ 0 ], segCenter );
				
		var 	plugger = new cc.Node ( );
		var 	pluggerB = cc.PhysicsBody.createEdgeSegment ( seg [ 0 ], seg [ 1 ], cc.PhysicsMaterial ( 0.01, 0.0, 0.5 ), 20 );

		pluggerB.setDynamic ( true );
		pluggerB.setMass ( 30 );
		pluggerB.setMoment ( 100000 );
		plugger.setPhysicsBody ( pluggerB );
		plugger.setPosition ( segCenter );
//		this.addChild ( plugger );
		this.addChildEx ( plugger );
		
		pluggerB.setCategoryBitmask ( 0x02 );
		sgearB.setCollisionBitmask ( 0x04 | 0x01 );
		_world.addJoint ( cc.PhysicsJointPin.create ( body, pluggerB, cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 75, -90 ) ) ) );
		_world.addJoint ( cc.PhysicsJointDistance.create ( pluggerB, sgearB, pluggerB.world2Local ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 75, 0 ) ) ), cp.v ( 44, 0 ) ) );		
	},
	
	update:function ( delta )
	{
		var		bodies = this._scene.getPhysicsWorld ( ).getAllBodies ( );
		for ( var i in bodies )
		{
			var		body = bodies [ i ];
			if ( body.getTag ( ) == DRAG_BODYS_TAG && body.getPosition ( ).y < 0.0 )
			{
				body.getNode ( ).setPosition ( cp.v.add ( VisibleRect.leftTop ( ), cp.v ( 75 + cc.random0To1 ( ) * 90, 0 ) ) );
				body.setVelocity ( cp.v ( 0, 0 ) );
			}
		}
		
		var 	gear = this._scene.getPhysicsWorld ( ).getBody ( 1 );
		if ( gear != null )
		{
			if ( this._distance != 0.0 )
			{
				this._rotationV += this._distance / 2500.0;

				if ( this._rotationV >  30 ) this._rotationV =  30.0;
				if ( this._rotationV < -30 ) this._rotationV = -30.0;
			}

			gear.setAngularVelocity ( this._rotationV );
			this._rotationV *= 0.995;
		}
	},
	
	onTouchBegan:function ( touch, event )
	{
		this._super ( touch, event );
		
		this._distance = touch.getLocation ( ).x - VisibleRect.center ( ).x;
		
		return true;
	},
	
	onTouchMoved:function ( touch, event )
	{
		this._super ( touch, event );
		
		this._distance = touch.getLocation ( ).x - VisibleRect.center ( ).x;
	},
	
	onTouchEnded:function ( touch, event )
	{
		this._super ( touch, event );
		
		this._distance = 0;
	},
});

/////////////////////////////////////////////
PhysicsDemoOneWayPlatform = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "One Way Platform";			
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );		

		var 	ground = new cc.Node ( );
		ground.setPhysicsBody ( cc.PhysicsBody.createEdgeSegment ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 0, 50 ) ), cp.v.add ( VisibleRect.rightBottom ( ), cp.v ( 0, 50 ) ) ) );
//		this.addChild ( ground );
		this.addChildEx ( ground );

		var 	platform = this.makeBox ( VisibleRect.center ( ), cc.size ( 200, 50 ) );
		platform.getPhysicsBody ( ).setDynamic ( false );
		platform.getPhysicsBody ( ).setContactTestBitmask ( 0xFFFFFFFF );
//		this.addChild ( platform );
		this.addChildEx ( platform );

		var 	ball = this.makeBall ( cp.v.sub ( VisibleRect.center ( ), cp.v ( 0, 50 ) ), 20 );
		ball.getPhysicsBody ( ).setVelocity ( cp.v ( 0, 150 ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		ball.getPhysicsBody ( ).setMass ( 1.0 );
		ball.getPhysicsBody ( ).setContactTestBitmask ( 0xFFFFFFFF );
//		this.addChild ( ball );
		this.addChildEx ( ball );

		/*
		var 	contactListener = EventListenerPhysicsContactWithBodies::create(platform.getPhysicsBody(), ball.getPhysicsBody() );
		contactListener->onContactBegin = CC_CALLBACK_1(PhysicsDemoOneWayPlatform::onContactBegin, this);
		_eventDispatcher->addEventListenerWithSceneGraphPriority(contactListener, this);
		*/
	},
	
	onContactBegin:function ( contact )
	{
		return contact.getContactData ( ).normal.y < 0;
	}
});

/////////////////////////////////////////////
PhysicsDemoSlice = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Slice";
		this._subtitle = "click and drag to slice up the block";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this.onToggleDebug ( );

		this._sliceTag = 1;
		this._startPos = null;

		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : function ( touch, event )
			{
				this._startPos = touch.getLocation ( );
				return true;
			}.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );	

		var 	ground = new cc.Node ( );
		ground.setPhysicsBody ( cc.PhysicsBody.createEdgeSegment ( cp.v.add ( VisibleRect.leftBottom ( ), cp.v ( 0, 50 ) ), cp.v.add ( VisibleRect.rightBottom ( ), cp.v ( 0, 50 ) ) ) );
//		this.addChild ( ground );
		this.addChildEx ( ground );

		var 	box = new cc.Node ( );
		var 	points = [ cp.v ( -100, -100 ), cp.v ( -100, 100 ), cp.v ( 100, 100 ), cp.v ( 100, -100 ) ];
		box.setPhysicsBody ( cc.PhysicsBody.createPolygon ( points ) );
		box.setPosition ( VisibleRect.center ( ) );
		box.getPhysicsBody ( ).setTag ( this._sliceTag );
//		this.addChild ( box );		
		this.addChildEx ( box );	
	},
	
	slice:function ( world, info, data )
	{
		if ( info.shape.getBody ( ).getTag ( ) != this._sliceTag )
		{
			return true;
		}

		if ( !info.shape.containsPoint ( info.start ) && !info.shape.containsPoint ( info.end ) )
		{						
			var 	normal = cp.v.sub ( info.end, info.start );
			normal = cp.v.normalize ( cp.v.perp ( normal ) ); 
			var 	dist = cp.v.dot ( info.start, normal );

			this.clipPoly ( info.shape, normal, dist );
			this.clipPoly ( info.shape, cp.v.neg ( normal ), -dist );

			info.shape.getBody ( ).removeFromWorld ( );			
		}

		return true;
	},

	clipPoly:function ( shape, normal, distance )
	{	
		var 	body  = shape.getBody ( );
		var 	count = shape.getPointsCount ( );
		var 	pointsCount = 0;
		var 	points = new Array ( ); 		
		
		for ( var i = 0, j = count - 1; i < count; j = i, ++i )
		{				
			var 	a = body.local2World ( shape.getPoint ( j ) );
			var 	aDist = cp.v.dot ( a, normal ) - distance;

			if ( aDist < 0.0 )
			{
				points [ pointsCount ] = a;
				++pointsCount;
			}

			var 	b = body.local2World ( shape.getPoint ( i ) );
			var 	bDist = cp.v.dot ( b, normal ) - distance;

			if ( aDist * bDist < 0.0 )
			{
				var 	t = Math.abs ( aDist ) / ( Math.abs ( aDist ) + Math.abs ( bDist ) );
				points [ pointsCount ] = cp.v.lerp ( a, b, t );
				++pointsCount;
			}
		}
		
		var 	center = cc.PhysicsShape.getPolyonCenter ( points );
		var 	node   = new cc.Node ( );
		var 	polyon = cc.PhysicsBody.createPolygon ( points, cc.PHYSICSBODY_MATERIAL_DEFAULT, cp.v.neg ( center ) );		
		node.setPosition ( center );
		node.setPhysicsBody ( polyon );
		polyon.setVelocity ( body.getVelocityAtWorldPoint ( center ) );
		polyon.setAngularVelocity ( body.getAngularVelocity ( ) );
		polyon.setTag ( this._sliceTag );
//		this.addChild ( node );
		this.addChildEx ( node );
	},

	onTouchEnded:function ( touch, event )
	{
//		this._scene.getPhysicsWorld ( ).rayCast ( this.slice.bind ( this ), touch.getStartLocation ( ), touch.getLocation ( ), null );
		this._scene.getPhysicsWorld ( ).rayCast ( this.slice.bind ( this ), this._startPos, touch.getLocation ( ), null );
	}
});

/////////////////////////////////////////////
PhysicsDemoBug3988 = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Bug3988";
		this._subtitle = "All the Rectangles should have same rotation angle";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this.onToggleDebug ( );
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );

		var 	ball  = new cc.Sprite ( "res/Images/YellowSquare.png" );
		ball.setPosition ( cp.v.sub ( VisibleRect.center ( ), cp.v ( 100, 0 ) ) );
		ball.setRotation ( 30.0 );
		this.addChild ( ball );

		var 	physicsBall = this.makeBox ( cp.v.add ( VisibleRect.center ( ), cp.v ( 100, 0 ) ), cc.size ( 100, 100 ) );
		physicsBall.setRotation ( 30.0 );
//		this.addChild ( physicsBall );		
		this.addChildEx ( physicsBall );		
	}
});

/////////////////////////////////////////////
PhysicsContactTest = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Contact Test";
		this._subtitle = "should not crash";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );
		
		var 	s = VisibleRect.size ( );

		this._yellowBoxNum 		= 50;
		this._blueBoxNum 		= 50;
		this._yellowTriangleNum = 50;
		this._blueTriangleNum 	= 50;

		cc.MenuItemFont.setFontSize ( 65 );
		var 	decrease1 = new cc.MenuItemFont ( " - ", this.onDecrease, this );
		decrease1.setColor ( cc.color ( 0, 200, 20 ) );
		var 	increase1 = new cc.MenuItemFont ( " + ", this.onIncrease, this );
		increase1.setColor ( cc.color ( 0, 200, 20 ) );
		decrease1.setTag ( 1 );
		increase1.setTag ( 1 );

		var 	menu1 = new cc.Menu ( decrease1, increase1 );
		menu1.alignItemsHorizontally ( );
		menu1.setPosition ( cp.v ( s.width / 2, s.height - 50 ) );
		this.addChild ( menu1, 1 );

		var 	label = new cc.LabelTTF ( "yellow box", "Arial", 24 );
		this.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2 - 150, s.height - 50 ) );

		var 	decrease2 = new cc.MenuItemFont ( " - ", this.onDecrease, this );
		decrease2.setColor ( cc.color ( 0, 200, 20 ) );
		var 	increase2 = new cc.MenuItemFont ( " + ", this.onIncrease, this );
		increase2.setColor ( cc.color ( 0, 200, 20 ) );
		decrease2.setTag ( 2 );
		increase2.setTag ( 2 );
		
		var 	menu2 = new cc.Menu ( decrease2, increase2 );
		menu2.alignItemsHorizontally ( );
		menu2.setPosition ( cp.v ( s.width / 2, s.height - 90 ) );
		this.addChild ( menu2, 1 );

		label = new cc.LabelTTF ( "blue box", "Arial", 24 );
		this.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2 - 150, s.height - 90 ) );

		var 	decrease3 = new cc.MenuItemFont ( " - ", this.onDecrease, this );
		decrease3.setColor ( cc.color ( 0, 200, 20 ) );
		var 	increase3 = new cc.MenuItemFont ( " + ", this.onIncrease, this );
		increase3.setColor ( cc.color ( 0, 200, 20 ) );
		decrease3.setTag ( 3 );
		increase3.setTag ( 3 );

		var 	menu3 = new cc.Menu ( decrease3, increase3 );
		menu3.alignItemsHorizontally ( );
		menu3.setPosition ( cp.v ( s.width / 2, s.height - 130 ) );
		this.addChild ( menu3, 1 );

		label = new cc.LabelTTF ( "yellow triangle", "Arial", 24 );
		this.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2 - 150, s.height - 130 ) );

		var 	decrease4 = new cc.MenuItemFont ( " - ", this.onDecrease, this );
		decrease4.setColor ( cc.color ( 0, 200, 20 ) );
		var 	increase4 = new cc.MenuItemFont ( " + ", this.onIncrease, this );
		increase4.setColor ( cc.color ( 0, 200, 20 ) );
		decrease4.setTag ( 4 );
		increase4.setTag ( 4 );

		var 	menu4 = new cc.Menu ( decrease4, increase4 );
		menu4.alignItemsHorizontally ( );
		menu4.setPosition ( cp.v ( s.width / 2, s.height - 170 ) );
		this.addChild ( menu4, 1 );

		label = new cc.LabelTTF ( "blue triangle", "Arial", 24 );
		this.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2 - 150, s.height - 170 ) );
		
		this.resetTest ( );
	},
	
	onDecrease:function ( sender )
	{
		switch ( sender.getTag ( ) )
		{
			case 1 :	if ( this._yellowBoxNum 	 > 0 )	this._yellowBoxNum 		-= 50;		break;
			case 2 :	if ( this._blueBoxNum 		 > 0 )	this._blueBoxNum 		-= 50;		break;
			case 3 :	if ( this._yellowTriangleNum > 0 )	this._yellowTriangleNum -= 50;		break;
			case 4 :	if ( this._blueTriangleNum 	 > 0 )	this._blueTriangleNum 	-= 50;		break;
		}

		this.resetTest ( );
	},

	onIncrease:function ( sender )
	{
		switch ( sender.getTag ( ) )
		{
			case 1 :	this._yellowBoxNum 		+= 50;		break;
			case 2 :	this._blueBoxNum 		+= 50;		break;
			case 3 :	this._yellowTriangleNum += 50;		break;
			case 4 :	this._blueTriangleNum 	+= 50;		break;
		}

		this.resetTest ( );
	},

	resetTest:function ( )
	{
		this.removeChildByTag ( 100 );
		
		var 	root = new cc.Node ( );
		root.setTag ( 100 );
		this.addChild ( root );

		var 	s = VisibleRect.size ( );

		var 	label = new cc.LabelTTF ( this._yellowBoxNum, "Arial", 24 );
		root.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2, s.height - 50 ) );

		label = new cc.LabelTTF ( this._blueBoxNum, "Arial", 24 );
		root.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2, s.height - 90 ) );

		label = new cc.LabelTTF ( this._yellowTriangleNum, "Arial", 24 );
		root.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2, s.height - 130 ) );

		label = new cc.LabelTTF ( this._blueTriangleNum, "Arial", 24 );
		root.addChild ( label, 1 );
		label.setPosition ( cp.v ( s.width / 2, s.height - 170 ) );

		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ), cc.PhysicsMaterial ( 0.1, 1, 0.0 ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		root.addChild ( wall );
		root.addChildEx ( wall );
		
//		var 	contactListener = EventListenerPhysicsContact::create();
//		contactListener->onContactBegin = this.onContactBegin, this);
//		_eventDispatcher->addEventListenerWithSceneGraphPriority(contactListener, this);
	
		// yellow box, will collide with itself and blue box.
		for ( var i = 0; i < this._yellowBoxNum; ++i )
		{
			var 	size = cc.size ( 10 + cc.random0To1 ( ) * 10, 10 + cc.random0To1 ( ) * 10 );
			var 	winSize = VisibleRect.size ( );
			var 	position = cp.v.sub ( cp.v ( winSize.width, winSize.height ), cp.v ( size.width, size.height ) );
			position.x = position.x * cc.random0To1 ( );
			position.y = position.y * cc.random0To1 ( );
			position = cp.v.add ( cp.v.add ( VisibleRect.leftBottom ( ), position ), cp.v ( size.width / 2, size.height / 2 ) );
			var 	velocity = cp.v ( ( cc.random0To1 ( ) - 0.5 ) * 200, ( cc.random0To1 ( ) - 0.5 ) * 200 );
			var 	box = this.makeBox ( position, size, 1, cc.PhysicsMaterial ( 0.1, 1, 0.0 ) );
			box.getPhysicsBody ( ).setVelocity ( velocity);
			box.getPhysicsBody ( ).setCategoryBitmask ( 0x01 );    // 0001
			box.getPhysicsBody ( ).setContactTestBitmask ( 0x04 ); // 0100
			box.getPhysicsBody ( ).setCollisionBitmask ( 0x03 );   // 0011
//			root.addChild ( box );
			root.addChildEx ( box );
		}

		// blue box, will collide with blue box.
		for ( var i = 0; i < this._blueBoxNum; ++i )
		{
			var 	size = cc.size ( 10 + cc.random0To1 ( ) * 10, 10 + cc.random0To1 ( ) * 10 );
			var 	winSize = VisibleRect.size ( );
			var 	position = cp.v.sub ( cp.v ( winSize.width, winSize.height ), cp.v ( size.width, size.height ) );
			position.x = position.x * cc.random0To1 ( );
			position.y = position.y * cc.random0To1 ( );
			position = cp.v.add ( cp.v.add ( VisibleRect.leftBottom ( ), position ), cp.v ( size.width / 2, size.height / 2 ) );
			var 	velocity = cp.v ( ( cc.random0To1 ( ) - 0.5 ) * 200, ( cc.random0To1 ( ) - 0.5 ) * 200 );
			var 	box = this.makeBox ( position, size, 2, cc.PhysicsMaterial ( 0.1, 1, 0.0 ) );
			box.getPhysicsBody ( ).setVelocity ( velocity);
			box.getPhysicsBody ( ).setCategoryBitmask ( 0x02 );    // 0010
			box.getPhysicsBody ( ).setContactTestBitmask ( 0x08 ); // 1000
			box.getPhysicsBody ( ).setCollisionBitmask ( 0x01 );   // 0001
//			root.addChild ( box );
			root.addChildEx ( box );
		}

		// yellow triangle, will collide with itself and blue box.
		for ( var i = 0; i < this._yellowTriangleNum; ++i )
		{
			var 	size = cc.size ( 10 + cc.random0To1 ( ) * 10, 10 + cc.random0To1 ( ) * 10 );
			var 	winSize = VisibleRect.size ( );
			var 	position = cp.v.sub ( cp.v ( winSize.width, winSize.height ), cp.v ( size.width, size.height ) );
			position.x = position.x * cc.random0To1 ( );
			position.y = position.y * cc.random0To1 ( );
			position = cp.v.add ( cp.v.add ( VisibleRect.leftBottom ( ), position ), cp.v ( size.width / 2, size.height / 2 ) );
			var 	velocity = cp.v ( ( cc.random0To1 ( ) - 0.5 ) * 300, ( cc.random0To1 ( ) - 0.5 ) * 300 );
			var 	triangle = this.makeTriangle ( position, size, 1, cc.PhysicsMaterial ( 0.1, 1, 0.0 ) );
			triangle.getPhysicsBody ( ).setVelocity ( velocity);
			triangle.getPhysicsBody ( ).setCategoryBitmask ( 0x04 );    // 0100
			triangle.getPhysicsBody ( ).setContactTestBitmask ( 0x01 ); // 0001
			triangle.getPhysicsBody ( ).setCollisionBitmask ( 0x06);   	// 0110
//			root.addChild ( triangle );
			root.addChildEx ( triangle );
		}

		// blue triangle, will collide with yellow box.
		for ( var i = 0; i < this._blueTriangleNum; ++i )
		{
			var 	size = cc.size ( 10 + cc.random0To1 ( ) * 10, 10 + cc.random0To1 ( ) * 10 );
			var 	winSize = VisibleRect.size ( );
			var 	position = cp.v.sub ( cp.v ( winSize.width, winSize.height ), cp.v ( size.width, size.height ) );
			position.x = position.x * cc.random0To1 ( );
			position.y = position.y * cc.random0To1 ( );
			position = cp.v.add ( cp.v.add ( VisibleRect.leftBottom ( ), position ), cp.v ( size.width / 2, size.height / 2 ) );
			var 	velocity = cp.v ( ( cc.random0To1 ( ) - 0.5 ) * 300, ( cc.random0To1 ( ) - 0.5 ) * 300 );
			var 	triangle = this.makeTriangle ( position, size, 2, cc.PhysicsMaterial ( 0.1, 1, 0.0 ) );
			triangle.getPhysicsBody ( ).setVelocity ( velocity );
			triangle.getPhysicsBody ( ).setCategoryBitmask ( 0x08 );    // 1000
			triangle.getPhysicsBody ( ).setContactTestBitmask ( 0x02 ); // 0010
			triangle.getPhysicsBody ( ).setCollisionBitmask ( 0x01 );   // 0001
//			root.addChild ( triangle );
			root.addChildEx ( triangle );
		}
	},

	onContactBegin:function ( contact )
	{
		/*
		PhysicsBody* a = contact.getShapeA().getBody();
		PhysicsBody* b = contact.getShapeB().getBody();
		PhysicsBody* body = (a.getCategoryBitmask() == 0x04 || a.getCategoryBitmask() == 0x08) ? a : b;
		CC_UNUSED_PARAM(body);
		CC_ASSERT(body.getCategoryBitmask() == 0x04 || body.getCategoryBitmask() == 0x08);
		*/

		return true;
	}

	
});

/////////////////////////////////////////////
PhysicsPositionRotationTest = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Position/Rotation Test";			
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this.onToggleDebug ( );
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );

		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );

		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( wall );
		this.addChildEx ( wall );

		// anchor test
		var 	anchorNode = new cc.Sprite ( "res/Images/YellowSquare.png" );
		anchorNode.setAnchorPoint ( cp.v ( 0.1, 0.9 ) );
		anchorNode.setPosition ( 100, 100 );
		anchorNode.setScale ( 0.25 );
//		this.addChild ( anchorNode );
		this.addChildEx ( anchorNode );
		anchorNode.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( anchorNode.getContentSize ( ).width * anchorNode.getScale ( ), anchorNode.getContentSize ( ).height * anchorNode.getScale ( ) ) ) );
		anchorNode.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		
		// parent test
		var 	parent = new cc.Sprite ( "res/Images/YellowSquare.png" );
		parent.setPosition ( 200, 100 );
		parent.setScale ( 0.25 );
		parent.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( parent.getContentSize ( ).width * anchorNode.getScale ( ), parent.getContentSize ( ).height * anchorNode.getScale ( ) ) ) );
		parent.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		this.addChild ( parent );
		this.addChildEx ( parent );		
		
		var 	leftBall = new cc.Sprite ( "res/Images/ball.png" );
		leftBall.setPosition ( -30, 0 );
		leftBall.setScale ( 2 );																			// ?
		leftBall.setPhysicsBody ( cc.PhysicsBody.createCircle ( leftBall.getContentSize ( ).width / 4 ) );	// ?
		leftBall.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		parent.addChild ( leftBall );
		parent.addChildEx ( leftBall );
		
		// offset position rotation test
		var 	offsetPosNode = new cc.Sprite ( "res/Images/YellowSquare.png" );
		offsetPosNode.setPosition ( 100, 200 );
		offsetPosNode.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( offsetPosNode.getContentSize ( ).width / 2, offsetPosNode.getContentSize ( ).height / 2 ) ) );
		offsetPosNode.getPhysicsBody ( ).setPositionOffset ( cp.v ( -offsetPosNode.getContentSize ( ).width / 2, -offsetPosNode.getContentSize ( ).height / 2 ) );
		offsetPosNode.getPhysicsBody ( ).setRotationOffset ( 45 );
		offsetPosNode.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		this.addChild ( offsetPosNode );
		this.addChildEx ( offsetPosNode );		
	}
});

/////////////////////////////////////////////
PhysicsSetGravityEnableTest = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Set Gravity Enable Test";		
		this._subtitle = "only yellow box drop down";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );

		// wall
		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ), cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( wall );
		this.addChildEx ( wall );
		
		// common box
		var 	commonBox = this.makeBox ( cp.v ( 100, 100 ), cc.size ( 50, 50 ), 1 );
		commonBox.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		this.addChild ( commonBox );
		this.addChildEx ( commonBox );
		
		var 	box = this.makeBox ( cp.v ( 200, 100 ), cc.size ( 50, 50 ), 2 );
		box.getPhysicsBody ( ).setMass ( 20 );
		box.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		box.getPhysicsBody ( ).setGravityEnable ( false );
//		this.addChild ( box );
		this.addChildEx ( box );
		
		var 	ball = this.makeBall ( cp.v ( 200, 200 ), 50 );
		ball.setTag ( 2 );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		ball.getPhysicsBody ( ).setGravityEnable ( false );
//		this.addChild ( ball );
		this.addChildEx ( ball );
		ball.getPhysicsBody ( ).setMass ( 50 );
		
		this.scheduleOnce ( this.onScheduleOnce, 1.0 );		
	},
	
	onScheduleOnce:function ( delta )
	{
		var 	ball = this.getChildByTag ( 2 );
		ball.getPhysicsBody ( ).setMass ( 200 );

		this._scene.getPhysicsWorld ( ).setGravity ( cp.v ( 0, 98 ) );
	}
});

/////////////////////////////////////////////
Bug5482 = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "bug 5482: setPhysicsBodyTest";			
		this._subtitle = "change physics body to the other.";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
		
		this.onToggleDebug ( );
		
		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
			onTouchMoved : this.onTouchMoved.bind ( this ),
			onTouchEnded : this.onTouchEnded.bind ( this )
		}, this );

		this._bodyInA = false;

		// wall
		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ), cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( wall );
		this.addChildEx ( wall );

		// button
		cc.MenuItemFont.setFontSize ( 18 );
		this._button = new cc.MenuItemFont ( "Set Body To A", this.changeBodyCallback, this );

		var 	menu = new cc.Menu ( this._button );
		this.addChild ( menu );

		this._nodeA = new cc.Sprite ( "res/Images/YellowSquare.png" );
		this._nodeA.setPosition ( VisibleRect.center ( ).x - 150, 100 );
//		this.addChild ( this._nodeA );
		this.addChildEx ( this._nodeA );

		this._nodeB = new cc.Sprite ( "res/Images/YellowSquare.png" );
		this._nodeB.setPosition ( VisibleRect.center ( ).x + 150, 100 );
//		this.addChild ( this._nodeB );
		this.addChildEx ( this._nodeB );

		this._body = cc.PhysicsBody.createBox ( this._nodeA.getContentSize ( ) );
		this._body.setTag ( DRAG_BODYS_TAG );
//		this._body.retain ( );		// How to implement
	},
	
	changeBodyCallback:function ( sender )
	{
		var 	node = this._bodyInA ? this._nodeB : this._nodeA;
		
		node.setPhysicsBody ( this._body );

		this._bodyInA = !this._bodyInA;
	}	
	
});

/////////////////////////////////////////////
PhysicsFixedUpdate = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Fixed Update Test";		
		this._subtitle = "The secend ball should not run across the wall";
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
				
		this.onToggleDebug ( );
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );

		// wall
		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ), cc.PhysicsMaterial ( 0.1, 1, 0.0 ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( wall );
		this.addChildEx ( wall );

		this.addBall ( );

		this.scheduleOnce ( this.updateStart, 2 );
	},

	addBall:function ( )
	{
		var 	ball = new cc.Sprite ( "res/Images/ball.png" );
		ball.setPosition ( 100, 100 );
		ball.setPhysicsBody ( cc.PhysicsBody.createCircle ( ball.getContentSize ( ).width / 2, cc.PhysicsMaterial ( 0.1, 1, 0.0 ) ) );
		ball.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		ball.getPhysicsBody ( ).setVelocity ( cp.v ( 1000, 20 ) );
//		this.addChild ( ball );
		this.addChildEx ( ball );
	},
	
	updateStart:function ( delta )
	{
	    this.addBall ( );
	
	    this._scene.getPhysicsWorld ( ).setAutoStep ( false );
	    this.scheduleUpdate ( );
	},

	update:function ( delta )
	{
		// use fixed time and calculate 3 times per frame makes physics simulate more precisely.
		for ( var i = 0; i < 3; ++i )
		{
			this._scene.getPhysicsWorld ( ).step ( 1 / 180.0 );
		}
	}	
});

/////////////////////////////////////////////
PhysicsTransformTest = PhysicsBaseLayer.extend
({
	ctor:function ( )
	{
		this._super ( );

		this._title = "Physics transform test";			
	},

	onEnter:function ( ) 
	{
		this._super ( ); 
				
		this.onToggleDebug ( );
		this._scene.getPhysicsWorld ( ).setGravity ( cp.vzero );

		cc.eventManager.addListener 
		({
			event : cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches : true,
			onTouchBegan : this.onTouchBegan.bind ( this ),
		}, this );

		var 	wall = new cc.Node ( );
		wall.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( VisibleRect.size ( ), cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		wall.setPosition ( VisibleRect.center ( ) );
//		this.addChild ( wall );
		this.addChildEx ( wall );

		//parent test
		var 	parent = new cc.Sprite ( "res/Images/YellowSquare.png" );
		parent.setPosition ( 200, 100 );
		parent.setScale ( 0.25 );
		parent.setPhysicsBody ( cc.PhysicsBody.createBox ( cc.size ( parent.getContentSize ( ).width * parent.getScale ( ), parent.getContentSize ( ).height * parent.getScale ( ) ), cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		parent.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
		parent.setTag ( 1 );
//		this.addChild ( parent );
		this.addChildEx ( parent );

		var 	leftBall = new cc.Sprite ( "res/Images/ball.png" );
		leftBall.setPosition ( -30, 0 );
		leftBall.setScale ( 2 );
		leftBall.setPhysicsBody ( cc.PhysicsBody.createCircle ( leftBall.getContentSize ( ).width, cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		leftBall.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		parent.addChild ( leftBall );
		parent.addChildEx ( leftBall );

		var 	scaleTo = cc.scaleTo ( 2.0, 0.5 );
		var 	scaleBack = cc.scaleTo ( 2.0, 1.0 );
		parent.runAction ( cc.sequence ( scaleTo, scaleBack ).repeatForever ( ) ); 

		var 	normal = new cc.Sprite ( "res/Images/YellowSquare.png" );
		normal.setPosition ( 300, 100 );
		normal.setScale ( 0.25, 0.5 );
		var 	size = parent.getContentSize ( );
		size.width  *= normal.getScaleX ( );
		size.height *= normal.getScaleY ( );
		normal.setPhysicsBody ( cc.PhysicsBody.createBox ( size, cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		normal.getPhysicsBody ( ).setTag ( DRAG_BODYS_TAG );
//		this.addChild ( normal );
		this.addChildEx ( normal );

		var 	bullet = new cc.Sprite ( "res/Images/ball.png" );
		bullet.setPosition ( 200, 200 );
		bullet.setPhysicsBody ( cc.PhysicsBody.createCircle ( bullet.getContentSize ( ).width / 2, cc.PhysicsMaterial ( 0.1, 1.0, 0.0 ) ) );
		bullet.getPhysicsBody ( ).setVelocity ( cp.v ( 100, 100 ) );
//		this.addChild ( bullet );
		this.addChildEx ( bullet );
	
		var 	move 	= cc.moveBy ( 2.0, cp.v (  100,  100 ) );
		var 	move2 	= cc.moveBy ( 2.0, cp.v ( -200,    0 ) );
		var	 	move3 	= cc.moveBy ( 2.0, cp.v (  100, -100 ) );
		var 	scale 	= cc.scaleTo ( 3.0, 0.3 );
		var 	scale2 	= cc.scaleTo ( 3.0, 1.0 );
		var 	rotate  = cc.rotateBy ( 6.0, 360 );
		
		this.runAction ( cc.sequence ( move, move2, move3 ).repeatForever ( ) );
		this.runAction ( cc.sequence ( scale, scale ).repeatForever ( ) );
		this.runAction ( rotate.repeatForever ( ) );		
	},
	
	onTouchBegan:function ( touch, event )
	{
		var 	child = this.getChildByTag ( 1 );
		child.setPosition ( this.convertTouchToNodeSpace ( touch ) );
		return false;
	}
});

// Physics Demos
var arrayOfPhysicsTest = 
[
 	PhysicsDemoLogoSmash,
 	PhysicsDemoPyramidStack,	
 	PhysicsDemoClickAdd,
 	PhysicsDemoRayCast,
 	PhysicsDemoJoints,
 	PhysicsDemoActions,
 	PhysicsDemoPump,
 	PhysicsDemoOneWayPlatform,
 	PhysicsDemoSlice,
 	PhysicsDemoBug3988,
 	PhysicsContactTest,
 	PhysicsPositionRotationTest,
 	PhysicsSetGravityEnableTest,
 	Bug5482,
 	PhysicsFixedUpdate,
 	PhysicsTransformTest
];

var nextPhysicsTest = function ( )
{
	physicsTestSceneIdx++;
	physicsTestSceneIdx = physicsTestSceneIdx % arrayOfPhysicsTest.length;

	return new arrayOfPhysicsTest [ physicsTestSceneIdx ] ( );
};

var previousPhysicsTest = function ( )
{
	physicsTestSceneIdx--;
	if ( physicsTestSceneIdx < 0 )
		physicsTestSceneIdx += arrayOfPhysicsTest.length;

	return new arrayOfPhysicsTest [ physicsTestSceneIdx ] ( );
};

var restartPhysicsTest = function ( )
{
	return new arrayOfPhysicsTest [ physicsTestSceneIdx ] ( );
};
