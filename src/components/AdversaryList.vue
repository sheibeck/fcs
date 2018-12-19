<template>
  <div class="container mt-2">
    <!-- list of adversaries -->
    <div class='js-adversary-list'>

      <div v-if="!id" class="row d-print-none mb-2">
        <div v-if="!isAuthenticated" class="col col-sm-12 col-md-3">
          <a href='/login' type="button" class="btn btn-primary">
              Login to Create an Adversary <span class='dice'>A</span>
          </a>
        </div>

        <div v-if="isAuthenticated" class="col col-sm-7 col-md-4">
          <a role="button" href="/adversary/edit" class="btn btn-success js-create-adversary">Create Adversary <i class='fa fa-plus'></i></a>
        </div>
        <div v-if="isAuthenticated" class="col col-sm-3 col-md-3">
          <input type="checkbox" class="form-check-input" id="my_adversaries" v-on:change="list()" />
          <label class="form-check-label" for="my_adversaries">Show only my adversaries?</label>
        </div>

        <div class="col col-md-3 fs-tools adversaryFilter hidden">
          <span class="badge badge-warning " style="cursor:pointer;" v-on:click="clearFilter()">x Clear Filter</span>
        </div>
      </div>

      <div class='card-columns' id="adversaryDetail">
        <div class='card' v-for="(item, index) in adversaries">
          <img v-if="item.adversary_image" class="card-img-top img-fluid img-thumbnail" style="object-fit: cover; object-position:top; max-height: 180px;" v-bind:src="item.adversary_image" v-bind:alt="item.adversary_name + 'Image'">

          <h4 class='card-header adversary-name bg-light'>
            <a v-bind:href="'/adversary/' + item.adversary_slug" style="text-decoration:none;">{{item.adversary_name}}</a>
            <small v-if="isOwner(item.adversary_owner_id)">
              <a v-if="isOwner(item.adversary_owner_id)" v-bind:href="'/adversary/edit/' + item.adversary_slug" class='d-print-none' style="color: #888 !important;"><i class='fa fa-edit'></i></a>
            </small>
          </h4>

          <div v-if="!isEmpty(item.adversary_aspects)">
            <h5 class='card-header py-0'>Aspects</h5>
            <p class='card-text px-4 my-0' v-for="aspect in item.adversary_aspects">
              <strong>{{fixLabel(aspect)}}</strong>
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_skills)">
            <h5 class='card-header py-0'>Skills</h5>

            <p class='card-text px-4 my-0' v-for="(skill, skillIndex) in item.adversary_skills">
                <strong>{{skillIndex}}</strong> {{fixLabel(skill)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_stunts)">
            <h5 class='card-header py-0'>Stunts & Extras</h5>

            <p class='card-text px-4 my-0' v-for="(stunt, stuntIndex) in item.adversary_stunts">
                <strong>{{stuntIndex}}</strong> {{fixLabel(stunt)}}
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_stress)">
            <h5 class='card-header py-0'>Stress</h5>

            <p class='card-text px-4 my-0' v-for="(stressMain, stressMainIndex) in item.adversary_stress">
                <strong>{{stressMainIndex}}</strong>
                <span v-for="(stressValue, stressIndex) in stressMain">
                  <input type='checkbox' v-bind:value='stressValue'>{{stressIndex}}
                </span>
            </p>
          </div>

          <div v-if="!isEmpty(item.adversary_consequences)">
            <h5 class='card-header py-0'>Consequences</h5>

            <p class='card-text px-4 my-0' v-for="(con, conIndex) in item.adversary_consequences">
                <strong>{{conIndex}}</strong> {{fixLabel(con)}}
            </p>
          </div>

          <div class='card-footer'>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.adversary_system' v-on:click="searchByTag">{{item.adversary_system}}</span>
              <span class='badge badge-dark js-adversary-tag' v-bind:data-search-text='item.adversary_genre' v-on:click="searchByTag">{{item.adversary_genre}}</span>
              <span v-bind:class="badgeColor(item.adversary_type) + ' badge js-adversary-tag'" v-bind:data-search-text='item.adversary_type' v-on:click="searchByTag">{{item.adversary_type}}</span>
          </div>
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
  metaInfo() {
    return {
       title: this.title,
       meta: [
         { vmid: 'description', name: 'description', content: this.description }
       ]
     }
  },
  computed: {
    ...mapGetters([
      'isAuthenticated',
      'userId',
    ]),
  },
  watch: {
    userId() {
      //wait for our authentication
      this.list();
    }
  },
  data () {
    return {
      title: "Adversary List",
      id: this.$route.params.id,
      adversaries: {},
      title: "Adversary List",
      description: "Fate Adversaries",
    }
  },
  methods : {
    list : function (searchText) {
        //reference this component so we can get/set data
        var $component = this;

        if (searchText)
        {
          $(".adversaryFilter").removeClass("hidden");
        }
        else {
          $(".adversaryFilter").addClass("hidden");
        }

        //if we have a specified slug then we want just this one entry
        if ($component.id) {
          searchText = $component.id;
        }

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

                  $component.title = adversaries[0].adversary_name + ' (Adversary)';
                  $component.description = adversaries[0].adversary_type;
                }
                else {
                  $('#adversaryDetail').addClass('card-columns');

                  $component.title = "Adversary List";
                  $component.description = "Fate Adversaries";
                }

                $component.adversaries = adversaries;
            }
        });
    },
    fixLabel: function (val) {
        return val.replace(/_/g, ' ').replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });;
    },
    isEmpty: function(obj) {
      for(var key in obj) {
          if(obj.hasOwnProperty(key))
              return false;
      }
      return true;
    },
    badgeColor: function(type) {
      var badge;

      switch(type) {
        case "Enemy":
          badge = "badge-danger";
          break;
        case 'Obstacle':
          badge = "badge-warning";
          break;
        case "Constraint":
          badge = "badge-info";
          break;
        default:
          badge = "badge-dark";
          break;
      }

      return badge;
    },
    searchByTag : function(event) {
      var tag = $(event.currentTarget).data('search-text');
      $('#search-text').val(tag);
      this.list(tag);
    },
    clearFilter : function() {
      $('#search-text').val("");
      this.list("");
    },
    isOwner : function(ownerId) {
      return this.userId === ownerId;
    }

  }
}
</script>
