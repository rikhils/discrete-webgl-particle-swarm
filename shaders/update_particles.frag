#version 300 es

precision highp float;
precision highp int;
precision highp isampler2D ;
precision highp usampler2D ;

uniform sampler2D positions_texture, velocities_texture;
uniform usampler2D  itinymtState, itinymtMat;

layout (location = 0) out vec4 new_position;
layout (location = 1) out uvec4 otinymtState;

in vec2 cc;


uniform vec4 lower_bounds, upper_bounds;

#define D0_LOWER_BOUND lower_bounds.r
#define D1_LOWER_BOUND lower_bounds.g
#define D2_LOWER_BOUND lower_bounds.b
#define D3_LOWER_BOUND lower_bounds.a

#define D0_UPPER_BOUND upper_bounds.r
#define D1_UPPER_BOUND upper_bounds.g
#define D2_UPPER_BOUND upper_bounds.b
#define D3_UPPER_BOUND upper_bounds.a

uniform float learning_rate;

#define P0_POS positions.r
#define P1_POS positions.g
#define P2_POS positions.b
#define P3_POS positions.a

#define P0_VEL velocities.r
#define P1_VEL velocities.g
#define P2_VEL velocities.b
#define P3_VEL velocities.a


/*@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * tinymt.glsl  :   a glsl file to be included the in the shaders
 *
 * PROGRAMMER   :   ABOUZAR KABOUDIAN
 * DATE         :   Tue 31 Mar 2020 14:25:32 (EDT)
 * PLACE        :   Chaos Lab @ GaTech, Atlanta, GA
 *@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */

// global variables and the macros for the tinymt algorithm --------------
uvec4 tinymtState, tinymtMat ;

#define TINYMT32_SH0    1
#define TINYMT32_SH1    10
#define TINYMT32_SH8    8
#define TINYMT32_MASK   uint(0x7fffffff)
#define MIN_LOOP        8
#define PRE_LOOP        8

#define MAX_INT         4294967295
#define MAX_INT_F       4294967295.

/*========================================================================
 * initTinyMt : initialize the Tiny Marsenne Twister for the shader
 *========================================================================
 */
void tinymtInit(){
    // Initialize the random number states
    tinymtState = texture( itinymtState, cc ) ;
    tinymtMat   = texture( itinymtMat,   cc ) ;
    return ;
}

/*========================================================================
 * finish the tiny marsenne twister algorithm: should be called before the
 * shader return call ;
 *========================================================================
 */
void tinymtFinish(){
    otinymtState = uvec4(tinymtState) ;
}
#define tinymtReturn  tinymtFinish

/*========================================================================
 * Iterate to the next state
 *========================================================================
 */
void tinymtNextState(){
    uint x,y ;
    y = tinymtState.a ;
    x = (tinymtState.r & TINYMT32_MASK)
        ^ tinymtState.g
        ^ tinymtState.b;
    x ^= (x << TINYMT32_SH0);
    y ^= (y >> TINYMT32_SH0) ^ x;
    tinymtState.r = tinymtState.g;
    tinymtState.g = tinymtState.b;
    tinymtState.b = x ^ (y << TINYMT32_SH1);
    tinymtState.a = y;
    tinymtState.g ^= uint(-int(y & uint(1)) & int(tinymtMat.r));
    tinymtState.b ^= uint(-int(y & uint(1)) & int(tinymtMat.g));

    return ;
}

/*========================================================================
 * temper the results
 *========================================================================
 */
uint  tinymtTemper() {
    uint t0, t1;
    t0 = tinymtState.a;
#if defined(LINEARITY_CHECK)
  t1 = tinymtState.r
      ^ (tinymtState.b >> TINYMT32_SH8);
#else
    t1 = tinymtState.r
        + (tinymtState.b >> TINYMT32_SH8);
#endif
    t0 ^= t1;
    t0 ^= uint(-int(t1 & uint(1)) & int(tinymtMat[2]));
    return t0;
}

/*========================================================================
 * Get a random number using the tiny marsenne twister
 *========================================================================
 */
uint tinymtUrand(){
    tinymtNextState() ;
    return tinymtTemper() ;
}

/*========================================================================
 * tinymtFrand : returns a float number between 0-1 using the tiny mt
 * algorithm.
 *========================================================================
 */
float tinymtFrand(){
    return float(tinymtUrand())/MAX_INT_F ;
}
#define tinymtRand tinymtFrand

/*========================================================================
 * returns an integer with the binomial distribution with a Bernouli trail
 * of "npar" attempts with each attempt a chance of success of "p"
 *========================================================================
 */
uint tinymtBinran(float p, uint npar){
    uint isum = 0u ;
    if ( p > 0.1 ){
        for(uint i=0u ; i<npar ; i++){
            if ( tinymtRand() < p ){
                isum++ ;
            }
        }
    }else{ /* for small probablities of p use a geometric distribution */
        isum = uint( floor ( log( 1. - tinymtRand() ) /
                             log( 1. - p            )   ) ) ;
    }
    return isum ;
}
/*

    END TINYMT COPY/PASTE

*/




float bounds_check(float p_val, float p_min, float p_max)
{
	float retVal;
	if(p_val >= p_max)
	{
		retVal = p_min + (0.75 * (p_max-p_min)) * tinymtRand();
	}
	else if(p_val <= p_min)
	{
		retVal = p_min + (0.25 * (p_max-p_min)) + (0.75 * (p_max-p_min)) * tinymtRand();
	}
	else
	{
		retVal = p_val;
	}

	return retVal;
}

void main() {
	tinymtInit();
    vec4 positions = texture(positions_texture, cc);
    vec4 velocities = texture(velocities_texture, cc);

    float new_p0 = P0_POS + learning_rate * P0_VEL;
    float new_p1 = P1_POS + learning_rate * P1_VEL;
    float new_p2 = P2_POS + learning_rate * P2_VEL;
    float new_p3 = P3_POS + learning_rate * P3_VEL;


    new_p0 = bounds_check(new_p0, D0_LOWER_BOUND, D0_UPPER_BOUND);
	new_p1 = bounds_check(new_p1, D1_LOWER_BOUND, D1_UPPER_BOUND);
	new_p2 = bounds_check(new_p2, D2_LOWER_BOUND, D2_UPPER_BOUND);
	new_p3 = bounds_check(new_p3, D3_LOWER_BOUND, D3_UPPER_BOUND);


    new_position = vec4(new_p0, new_p1, new_p2, new_p3);
    tinymtReturn();
}
