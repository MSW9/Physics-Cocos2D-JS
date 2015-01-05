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
		this.addChild ( menu );				
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

		var 	box = yellow ? new cc.Sprite ( "res/Images/YellowSquare.png") : new cc.Sprite ( "res/Images/YellowSquare.png" );
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

		var 	triangle = yellow ? new cc.Sprite ( "res/Images/YellowTriangle.png") : new cc.Sprite ( "res/Images/CyanTriangle.png" );
		
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
		node.setPhysicsBody ( cc.PhysicsBody.createEdgeBox ( cc.size ( VisibleRect.getVisibleRect ( ).width, VisibleRect.getVisibleRect ( ).height ) ) );
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
		//node->drawSegment(VisibleRect::leftBottom() + Vec2(0, 50), VisibleRect::rightBottom() + Vec2(0, 50), 1, STATIC_COLOR);
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

// Physics Demos
var arrayOfPhysicsTest = 
[
 	PhysicsDemoLogoSmash,
 	PhysicsDemoPyramidStack,	
 	PhysicsDemoClickAdd,
 	PhysicsDemoRayCast,
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
