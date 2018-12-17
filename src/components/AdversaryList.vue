<template>
  <div class="container mt-2">
    <!-- list of adversaries -->
    <div class='js-adversary-list'>
      <div v-if="!isAuthenticated" class="row d-print-none mb-2">
        <div class="col col-sm-12 col-md-3">
          <a href='login.htm' type="button" class="btn btn-primary">
              Login to Create an Adversary <span class='dice'>A</span>
          </a>
        </div>
        <div class="col col-md-3 fs-tools hidden">
          <span class="badge badge-warning js-clear-search" style="cursor:pointer;">x Clear Filter</span>
        </div>
      </div>

      <div v-if="isAuthenticated" class="row d-print-none mb-2">
        <div class="col col-sm-7 col-md-4">
          <button type="button" class="btn btn-success js-create-adversary">Create Adversary <i class='fa fa-plus'></i></button>
        </div>
        <div class="col col-sm-3 col-md-3">
          <input type="checkbox" class="form-check-input" id="my_adversaries" />
          <label class="form-check-label" for="my_adversaries">Show only my adversaries?</label>
        </div>
        <div class="col col-sm-3 col-md-3 fs-tools hidden">
          <span class="badge badge-warning js-clear-search" style="cursor:pointer;">x Clear Filter</span>
        </div>
      </div>

      <div class='card-columns' id="adversaryDetail">
        <div class='card' v-for="(item, index) in adversaries">
          <img v-if="item.adversary_image" class="card-img-top img-fluid img-thumbnail" style="object-fit: cover; object-position:top; max-height: 180px;" v-bind:src="item.adversary_image" v-bind:alt="item.adversary_name + 'Image'">

          <h4 class='card-header adversary-name bg-light'>
            <a v-bind:href="'/adversary/' + item.adversary_slug" style="text-decoration:none;">{{item.adversary_name}}</a>
          </h4>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'CharacterList',
  created(){
    fs_adversary.init();
  },
  computed: {
    slugify: function() {
      return this.adversaries.map(function(item) {
          //return '/adversary/' + item.adver + '/' + item.adver + '/' + fatesheet.slugify(item.name);
          return item;
      });
    },
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  watch: {
    userId () {
      //wait for our authenticated user id
      this.list();
    }
  },
  data () {
    return {
      title: "Adversary List",
      adversaries: {}
    }
  },
  methods : {
    list : function (searchText) {
      //reference this component so we can get/set data
      var $component = this;

        // Create DynamoDB document client
        var docClient = fatesheet.getDBClient();

        var params = {
            TableName: fs_adversary.config.adversarytable,
            Select: 'ALL_ATTRIBUTES'
        }

        //search
        if (searchText && searchText.length > 0) {
          params.ExpressionAttributeValues= {
            ':an': searchText,
            ':anl': searchText.toLowerCase(),
            ':anu': searchText.toUpperCase(),
            ':ant': searchText.toTitleCase(),
          };

          params.FilterExpression = '( contains (adversary_name, :an)';
          params.FilterExpression += ' OR contains (adversary_name, :anl)';
          params.FilterExpression += ' OR contains (adversary_name, :anu)';
          params.FilterExpression += ' OR contains (adversary_name, :ant)';

          params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :an)';
          params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anl)';
          params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :anu)';
          params.FilterExpression += ' OR contains (adversary_aspects.high_concept, :ant)';

          params.FilterExpression += ' OR contains (adversary_aspects.trouble, :an)';
          params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anl)';
          params.FilterExpression += ' OR contains (adversary_aspects.trouble, :anu)';
          params.FilterExpression += ' OR contains (adversary_aspects.trouble, :ant)';

          params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :an)';
          params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anl)';
          params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :anu)';
          params.FilterExpression += ' OR contains (adversary_aspects.other_aspects, :ant)';

          params.FilterExpression += ' OR contains (adversary_system, :an)';
          params.FilterExpression += ' OR contains (adversary_system, :anl)';
          params.FilterExpression += ' OR contains (adversary_system, :anu)';
          params.FilterExpression += ' OR contains (adversary_system, :ant)';

          params.FilterExpression += ' OR contains (adversary_type, :an)';
          params.FilterExpression += ' OR contains (adversary_type, :anl)';
          params.FilterExpression += ' OR contains (adversary_type, :anu)';
          params.FilterExpression += ' OR contains (adversary_type, :ant)';

          params.FilterExpression += ' OR contains (adversary_genre, :an)';
          params.FilterExpression += ' OR contains (adversary_genre, :anl)';
          params.FilterExpression += ' OR contains (adversary_genre, :anu)';
          params.FilterExpression += ' OR contains (adversary_genre, :ant)';

          params.FilterExpression += ' OR adversary_slug = :anl )';
        }

        //show only the current users adversaries if the box is checked
        if ($('#my_adversaries').is(':checked'))
        {
          if (!params.FilterExpression)
          {
            params.ExpressionAttributeValues = {':owner_id' : fatesheet.config.userId };
            params.FilterExpression = 'adversary_owner_id = :owner_id';
          }
          else {
            params.ExpressionAttributeValues[':owner_id'] = fatesheet.config.userId;
            params.FilterExpression += ' AND (adversary_owner_id = :owner_id)';
          }

        }

        docClient.scan(params, function (err, data) {
            if (err) {
                console.log("Error", err);
            } else {
                console.log("Success", data.Items);

                //dynamodb doesn't order items, it's a NODB. WE'll manually tweak a few
                // things to try and make them consistent
                var adversaries = data.Items.sort(function(a,b) {return (a["adversary_name"] > b["adversary_name"]) ? 1 : ((b["adversary_name"] > a["adversary_name"]) ? -1 : 0);} );
                $.each(adversaries, function(i, v) {
                  if (v.adversary_aspects)
                  {
                    const orderedAspects = {};
                    if (v.adversary_aspects["high_concept"])
                      orderedAspects["high_concept"] = v.adversary_aspects["high_concept"];
                    if (v.adversary_aspects["trouble"])
                      orderedAspects["trouble"] = v.adversary_aspects["trouble"];
                    if (v.adversary_aspects["other_aspects"])
                      orderedAspects["other_aspects"] = v.adversary_aspects["other_aspects"];

                    v.adversary_aspects = orderedAspects;
                  }

                  const orderedSkills = {};
                  Object.keys(v.adversary_skills).sort().forEach(function(key) {
                    orderedSkills[key] = v.adversary_skills[key];
                  });
                  v.adversary_skills = orderedSkills;

                  const orderedConsequences = {};
                  Object.keys(v.adversary_consequences).sort().forEach(function(key) {
                    orderedConsequences[key] = v.adversary_consequences[key];
                  });
                  v.adversary_consequences = orderedConsequences;
                });

                //make the display wider if we only have 1 adversary
                if (adversaries.length === 1)
                {
                  $('#adversaryDetail').removeClass('card-columns');
                }
                else {
                  $('#adversaryDetail').addClass('card-columns');
                }

                $component.adversaries = adversaries;
            }
        });
    }
  }
}
</script>
