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
//	    this._ball.addChild ( bullet );
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
