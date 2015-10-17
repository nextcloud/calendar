<?php
/**
 * ownCloud - Calendar App
 *
 * @author Raghu Nayyar
 * @author Georg Ehrke
 * @copyright 2014 Raghu Nayyar <beingminimal@gmail.com>
 * @copyright 2014 Georg Ehrke <oc.list@georgehrke.com>
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU AFFERO GENERAL PUBLIC LICENSE
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU AFFERO GENERAL PUBLIC LICENSE for more details.
 *
 * You should have received a copy of the GNU Affero General Public
 * License along with this library.  If not, see <http://www.gnu.org/licenses/>.
 *
 */
?>

<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('Repeat'))?></label>
	<select ng-model="repeatmodel" ng-options="repeat as repeat.displayname for repeat in repeater" ng-change="changerepeater(repeatmodel)">
	</select>
	<select ng-hide="monthday" ng-model="monthdaymodel" ng-options="day as day.displayname for day in monthdays" ng-change="changemonthday(monthdaymodel)">
	</select>
	<select ng-hide="yearly" ng-model="yearmodel" ng-options="year as year.displayname for year in years" ng-change="changeyear(yearmodel)">
	</select>
</fieldset>




<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('Interval'))?></label>
	<input type="number" min="1" max="1000" value="1" name="interval" ng-model="intervalmodel">
</fieldset>



<fieldset class="event-fieldset">
	<label class="label"><?php p($l->t('End'))?></label>
	<select>
		<option ng-repeat="end in ender" value="end.val" ng-model="end.val">{{ end.displayname }}</option>
	</select>
</fieldset>
<!--
		<div id="advanced_options_repeating">
			<table style="width:100%">
				<tbody><tr id="advanced_month" >
					<th width="75px"></th>
					<td>
						<select id="advanced_month_select" name="advanced_month_select">
							<option value="monthday" selected="selected">by monthday</option>
<option value="weekday">by weekday</option>
						</select>
					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_year" >
					<th width="75px"></th>
					<td>
						<select id="advanced_year_select" name="advanced_year_select">
							<option value="bydate" selected="selected">by events date</option>
<option value="byyearday">by yearday(s)</option>
<option value="byweekno">by weeknumber(s)</option>
<option value="bydaymonth">by day and month</option>
						</select>
					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_weekofmonth" >
					<th width="75px"></th>
					<td id="weekofmonthcheckbox">
						<select id="weekofmonthoptions" name="weekofmonthoptions">
							<option value="auto" selected="selected">events week of month</option>
<option value="1">first</option>
<option value="2">second</option>
<option value="3">third</option>
<option value="4">fourth</option>
<option value="5">fifth</option>
<option value="-1">last</option>
						</select>
					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_weekday" >
					<th width="75px"></th>
					<td id="weeklycheckbox">
						<select id="weeklyoptions" name="weeklyoptions[]" multiple="multiple" title="Select weekdays">
							<option value="Monday">Monday</option>
<option value="Tuesday" selected="selected">Tuesday</option>
<option value="Wednesday">Wednesday</option>
<option value="Thursday">Thursday</option>
<option value="Friday">Friday</option>
<option value="Saturday">Saturday</option>
<option value="Sunday">Sunday</option>
						</select><button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all" title="Select weekdays" aria-haspopup="true" style="width: 156px;"><span class="ui-icon ui-icon-triangle-2-n-s"></span><span>Tuesday</span></button>
					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_byyearday" >
					<th width="75px"></th>
					<td id="byyeardaycheckbox">
						<select id="byyearday" name="byyearday[]" multiple="multiple" title="Select days">
							<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
<option value="10">10</option>
<option value="11">11</option>
<option value="12">12</option>
<option value="13">13</option>
<option value="14">14</option>
<option value="15">15</option>
<option value="16">16</option>
<option value="17">17</option>
<option value="18">18</option>
<option value="19">19</option>
<option value="20">20</option>
<option value="21">21</option>
<option value="22">22</option>
<option value="23">23</option>
<option value="24">24</option>
<option value="25">25</option>
<option value="26">26</option>
<option value="27">27</option>
<option value="28">28</option>
<option value="29">29</option>
<option value="30">30</option>
<option value="31">31</option>
<option value="32">32</option>
<option value="33">33</option>
<option value="34">34</option>
<option value="35">35</option>
<option value="36">36</option>
<option value="37">37</option>
<option value="38">38</option>
<option value="39">39</option>
<option value="40">40</option>
<option value="41">41</option>
<option value="42">42</option>
<option value="43">43</option>
<option value="44">44</option>
<option value="45">45</option>
<option value="46">46</option>
<option value="47">47</option>
<option value="48">48</option>
<option value="49">49</option>
<option value="50">50</option>
<option value="51">51</option>
<option value="52">52</option>
<option value="53">53</option>
<option value="54">54</option>
<option value="55">55</option>
<option value="56">56</option>
<option value="57">57</option>
<option value="58">58</option>
<option value="59">59</option>
<option value="60">60</option>
<option value="61">61</option>
<option value="62">62</option>
<option value="63">63</option>
<option value="64">64</option>
<option value="65">65</option>
<option value="66">66</option>
<option value="67">67</option>
<option value="68">68</option>
<option value="69">69</option>
<option value="70">70</option>
<option value="71">71</option>
<option value="72">72</option>
<option value="73">73</option>
<option value="74">74</option>
<option value="75">75</option>
<option value="76">76</option>
<option value="77">77</option>
<option value="78">78</option>
<option value="79">79</option>
<option value="80">80</option>
<option value="81">81</option>
<option value="82">82</option>
<option value="83">83</option>
<option value="84">84</option>
<option value="85">85</option>
<option value="86">86</option>
<option value="87">87</option>
<option value="88">88</option>
<option value="89">89</option>
<option value="90">90</option>
<option value="91">91</option>
<option value="92">92</option>
<option value="93">93</option>
<option value="94">94</option>
<option value="95">95</option>
<option value="96">96</option>
<option value="97">97</option>
<option value="98">98</option>
<option value="99">99</option>
<option value="100">100</option>
<option value="101">101</option>
<option value="102">102</option>
<option value="103">103</option>
<option value="104">104</option>
<option value="105">105</option>
<option value="106">106</option>
<option value="107">107</option>
<option value="108">108</option>
<option value="109">109</option>
<option value="110">110</option>
<option value="111">111</option>
<option value="112">112</option>
<option value="113">113</option>
<option value="114">114</option>
<option value="115">115</option>
<option value="116">116</option>
<option value="117">117</option>
<option value="118">118</option>
<option value="119">119</option>
<option value="120">120</option>
<option value="121">121</option>
<option value="122">122</option>
<option value="123">123</option>
<option value="124">124</option>
<option value="125">125</option>
<option value="126">126</option>
<option value="127">127</option>
<option value="128">128</option>
<option value="129">129</option>
<option value="130">130</option>
<option value="131">131</option>
<option value="132">132</option>
<option value="133">133</option>
<option value="134">134</option>
<option value="135">135</option>
<option value="136">136</option>
<option value="137">137</option>
<option value="138">138</option>
<option value="139">139</option>
<option value="140">140</option>
<option value="141">141</option>
<option value="142">142</option>
<option value="143">143</option>
<option value="144">144</option>
<option value="145">145</option>
<option value="146">146</option>
<option value="147">147</option>
<option value="148">148</option>
<option value="149">149</option>
<option value="150">150</option>
<option value="151">151</option>
<option value="152">152</option>
<option value="153">153</option>
<option value="154">154</option>
<option value="155">155</option>
<option value="156">156</option>
<option value="157">157</option>
<option value="158">158</option>
<option value="159">159</option>
<option value="160">160</option>
<option value="161">161</option>
<option value="162">162</option>
<option value="163">163</option>
<option value="164">164</option>
<option value="165">165</option>
<option value="166">166</option>
<option value="167">167</option>
<option value="168">168</option>
<option value="169">169</option>
<option value="170">170</option>
<option value="171">171</option>
<option value="172">172</option>
<option value="173">173</option>
<option value="174">174</option>
<option value="175">175</option>
<option value="176">176</option>
<option value="177">177</option>
<option value="178">178</option>
<option value="179">179</option>
<option value="180">180</option>
<option value="181">181</option>
<option value="182">182</option>
<option value="183">183</option>
<option value="184">184</option>
<option value="185">185</option>
<option value="186">186</option>
<option value="187">187</option>
<option value="188">188</option>
<option value="189">189</option>
<option value="190">190</option>
<option value="191">191</option>
<option value="192">192</option>
<option value="193">193</option>
<option value="194">194</option>
<option value="195">195</option>
<option value="196">196</option>
<option value="197">197</option>
<option value="198">198</option>
<option value="199">199</option>
<option value="200">200</option>
<option value="201">201</option>
<option value="202">202</option>
<option value="203">203</option>
<option value="204">204</option>
<option value="205">205</option>
<option value="206">206</option>
<option value="207">207</option>
<option value="208">208</option>
<option value="209">209</option>
<option value="210">210</option>
<option value="211">211</option>
<option value="212">212</option>
<option value="213">213</option>
<option value="214">214</option>
<option value="215">215</option>
<option value="216">216</option>
<option value="217">217</option>
<option value="218">218</option>
<option value="219">219</option>
<option value="220">220</option>
<option value="221">221</option>
<option value="222">222</option>
<option value="223">223</option>
<option value="224">224</option>
<option value="225">225</option>
<option value="226">226</option>
<option value="227">227</option>
<option value="228">228</option>
<option value="229">229</option>
<option value="230">230</option>
<option value="231">231</option>
<option value="232">232</option>
<option value="233">233</option>
<option value="234">234</option>
<option value="235">235</option>
<option value="236">236</option>
<option value="237">237</option>
<option value="238">238</option>
<option value="239">239</option>
<option value="240">240</option>
<option value="241">241</option>
<option value="242">242</option>
<option value="243">243</option>
<option value="244">244</option>
<option value="245">245</option>
<option value="246">246</option>
<option value="247">247</option>
<option value="248">248</option>
<option value="249">249</option>
<option value="250">250</option>
<option value="251">251</option>
<option value="252">252</option>
<option value="253">253</option>
<option value="254">254</option>
<option value="255">255</option>
<option value="256">256</option>
<option value="257">257</option>
<option value="258">258</option>
<option value="259">259</option>
<option value="260">260</option>
<option value="261">261</option>
<option value="262">262</option>
<option value="263">263</option>
<option value="264">264</option>
<option value="265">265</option>
<option value="266">266</option>
<option value="267">267</option>
<option value="268">268</option>
<option value="269">269</option>
<option value="270">270</option>
<option value="271">271</option>
<option value="272">272</option>
<option value="273">273</option>
<option value="274">274</option>
<option value="275">275</option>
<option value="276">276</option>
<option value="277">277</option>
<option value="278">278</option>
<option value="279">279</option>
<option value="280">280</option>
<option value="281">281</option>
<option value="282">282</option>
<option value="283">283</option>
<option value="284">284</option>
<option value="285" selected="selected">285</option>
<option value="286">286</option>
<option value="287">287</option>
<option value="288">288</option>
<option value="289">289</option>
<option value="290">290</option>
<option value="291">291</option>
<option value="292">292</option>
<option value="293">293</option>
<option value="294">294</option>
<option value="295">295</option>
<option value="296">296</option>
<option value="297">297</option>
<option value="298">298</option>
<option value="299">299</option>
<option value="300">300</option>
<option value="301">301</option>
<option value="302">302</option>
<option value="303">303</option>
<option value="304">304</option>
<option value="305">305</option>
<option value="306">306</option>
<option value="307">307</option>
<option value="308">308</option>
<option value="309">309</option>
<option value="310">310</option>
<option value="311">311</option>
<option value="312">312</option>
<option value="313">313</option>
<option value="314">314</option>
<option value="315">315</option>
<option value="316">316</option>
<option value="317">317</option>
<option value="318">318</option>
<option value="319">319</option>
<option value="320">320</option>
<option value="321">321</option>
<option value="322">322</option>
<option value="323">323</option>
<option value="324">324</option>
<option value="325">325</option>
<option value="326">326</option>
<option value="327">327</option>
<option value="328">328</option>
<option value="329">329</option>
<option value="330">330</option>
<option value="331">331</option>
<option value="332">332</option>
<option value="333">333</option>
<option value="334">334</option>
<option value="335">335</option>
<option value="336">336</option>
<option value="337">337</option>
<option value="338">338</option>
<option value="339">339</option>
<option value="340">340</option>
<option value="341">341</option>
<option value="342">342</option>
<option value="343">343</option>
<option value="344">344</option>
<option value="345">345</option>
<option value="346">346</option>
<option value="347">347</option>
<option value="348">348</option>
<option value="349">349</option>
<option value="350">350</option>
<option value="351">351</option>
<option value="352">352</option>
<option value="353">353</option>
<option value="354">354</option>
<option value="355">355</option>
<option value="356">356</option>
<option value="357">357</option>
<option value="358">358</option>
<option value="359">359</option>
<option value="360">360</option>
<option value="361">361</option>
<option value="362">362</option>
<option value="363">363</option>
<option value="364">364</option>
<option value="365">365</option>
<option value="366">366</option>
						</select><button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all" title="Select days" aria-haspopup="true" style="width: 66px;"><span class="ui-icon ui-icon-triangle-2-n-s"></span><span>285</span></button>and the events day of year.					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_bymonthday">
					<th width="75px"></th>
					<td id="bymonthdaycheckbox">
						<select id="bymonthday" name="bymonthday[]" multiple="multiple" title="Select days">
							<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
<option value="10">10</option>
<option value="11">11</option>
<option value="12">12</option>
<option value="13" selected="selected">13</option>
<option value="14">14</option>
<option value="15">15</option>
<option value="16">16</option>
<option value="17">17</option>
<option value="18">18</option>
<option value="19">19</option>
<option value="20">20</option>
<option value="21">21</option>
<option value="22">22</option>
<option value="23">23</option>
<option value="24">24</option>
<option value="25">25</option>
<option value="26">26</option>
<option value="27">27</option>
<option value="28">28</option>
<option value="29">29</option>
<option value="30">30</option>
<option value="31">31</option>
						</select><button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all" title="Select days" aria-haspopup="true" style="width: 66px;"><span class="ui-icon ui-icon-triangle-2-n-s"></span><span>13</span></button>and the events day of month.					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_bymonth">
					<th width="75px"></th>
					<td id="bymonthcheckbox">
						<select id="bymonth" name="bymonth[]" multiple="multiple" title="Select months">
							<option value="January">January</option>
<option value="February">February</option>
<option value="March">March</option>
<option value="April">April</option>
<option value="May">May</option>
<option value="June">June</option>
<option value="July">July</option>
<option value="August">August</option>
<option value="September">September</option>
<option value="October" selected="selected">October</option>
<option value="November">November</option>
<option value="December">December</option>
						</select><button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all" title="Select months" aria-haspopup="true" style="width: 116px;"><span class="ui-icon ui-icon-triangle-2-n-s"></span><span>October</span></button>
					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr id="advanced_byweekno">
					<th width="75px"></th>
					<td id="bymonthcheckbox">
						<select id="byweekno" name="byweekno[]" multiple="multiple" title="Select weeks">
							<option value="1">1</option>
<option value="2">2</option>
<option value="3">3</option>
<option value="4">4</option>
<option value="5">5</option>
<option value="6">6</option>
<option value="7">7</option>
<option value="8">8</option>
<option value="9">9</option>
<option value="10">10</option>
<option value="11">11</option>
<option value="12">12</option>
<option value="13">13</option>
<option value="14">14</option>
<option value="15">15</option>
<option value="16">16</option>
<option value="17">17</option>
<option value="18">18</option>
<option value="19">19</option>
<option value="20">20</option>
<option value="21">21</option>
<option value="22">22</option>
<option value="23">23</option>
<option value="24">24</option>
<option value="25">25</option>
<option value="26">26</option>
<option value="27">27</option>
<option value="28">28</option>
<option value="29">29</option>
<option value="30">30</option>
<option value="31">31</option>
<option value="32">32</option>
<option value="33">33</option>
<option value="34">34</option>
<option value="35">35</option>
<option value="36">36</option>
<option value="37">37</option>
<option value="38">38</option>
<option value="39">39</option>
<option value="40">40</option>
<option value="41">41</option>
<option value="42" selected="selected">42</option>
<option value="43">43</option>
<option value="44">44</option>
<option value="45">45</option>
<option value="46">46</option>
<option value="47">47</option>
<option value="48">48</option>
<option value="49">49</option>
<option value="50">50</option>
<option value="51">51</option>
<option value="52">52</option>
						</select><button type="button" class="ui-multiselect ui-widget ui-state-default ui-corner-all" title="Select weeks" aria-haspopup="true" style="width: 66px;"><span class="ui-icon ui-icon-triangle-2-n-s"></span><span>42</span></button>and the events week of year.					</td>
				</tr>
			</tbody></table>
			<table style="width:100%">
				<tbody><tr>
					<th width="75px">Interval:</th>
					<td>
						<input style="width:350px;" type="number" min="1" size="4" max="1000" value="1" name="interval">
					</td>
				</tr>
				<tr>
					<th width="75px">End:</th>
					<td>
						<select id="end" name="end">
							<option value="never" selected="selected">never</option>
<option value="count">by occurrences</option>
<option value="date">by date</option>
						</select>
					</td>
				</tr>
				<tr>
					<th></th>
					<td id="byoccurrences">
						<input type="number" min="1" max="99999" id="until_count" name="byoccurrences" value="10">occurrences					</td>
				</tr>
				<tr>
					<th></th>
					<td id="bydate">
						<input type="text" name="bydate" value="" id="dp1445079800011" class="hasDatepicker">
					</td>
				</tr>
			</tbody></table>
		</div>

	-->
