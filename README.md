# Haydn's Phaser Node Framework
A small wrapper around Phaser 3 that I use to make video games. All it really does is split game logic into 'nodes', instead of putting it all in one huge scene.

## Prerequisites
* Yarn ^1.22.3
* Node ^12
* NPM ^6

## Install
Install into your project with yarn:
``` sh
yarn add https://github.com/BadMojoVeryBad/phaser-node-framework.git#master
```

You will also need to install the `reflect-metadata` package to get dependency injection to work:
``` sh
yarn add reflact-metadata
```

## Usage
The following concepts are used by this framework:

### Game
To create a game, we use the `Game` class:

``` ts
import 'reflect-metadata';
import { Game } from 'phaser-node-framework';

// Create a game that is 1280x720 pixels.
const game = Game.create(1280, 720);

// Start game.
game.start();
```

This will start a game with the specified dimensions! Note that we have to import 'reflect-metadata'. This is because the framework uses InversifyJS, which requires the additional reflection library.

### Scene

#### Adding a Scene to the Game
To add scenes to the game, create them by extending the `Scene` class:

``` ts
import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public init(): void {
    console.log('I am a scene!');
  }
}
```

And register the scene in the game:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

// Start game.
game.start();
```

This will run the scene immediately after loading is complete. The first registered scene will always run immediately after the loading.

#### Changing Scenes
In this framework, we only run one scene at a time. To switch scenes, call the `changeScene()` method with the key you registered the scene with:

``` ts
import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.changeScene('anotherScene');
  }
}
```

#### A Note About Scenes
In this framework, we (usually) don't use the `create()` and `update()` methods on scenes. We instead put our create and update logic in child nodes, which are discussed next.

### Nodes
Nodes are a way of splitting the large amount of logic in scenes into little bits. Nodes can be considered as "pieces of a scene".

#### Adding a Node to the Game
We can create a node like so:

``` ts
import { Node, injectable } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  public create(): void {
    // Equivelant to the scene's create() method.
    // To access the scene:
    console.log(this.scene);
  }

  public update(time: number, delta: number): void {
    // Equivelant to the scene's update() method.
  }

  public destroy(): void {
    // Remove any game objects and event listeners here.
  }
}
```

Register it in the Game:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

game.registerNode('player', PlayerNode);

// Start game.
game.start();
```

Then add it to any scene we like, in the `init()` method:

``` ts
import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public init(): void {
    this.addNode('player');
  }
}
```

#### Init Data for Nodes
Data can be passed to a node through the node's `init()` method, like so:

``` ts
import { Scene } from 'phaser-node-framework';

export class DefaultScene extends Scene {
  public init(): void {
    // Pass in data.
    this.addNode('player', {
      'someData': true
    });
  }
}
```

``` ts
import { Node, injectable } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  public init(data: Record<string, unknown>): void {
    // Get the data in the node.
    console.log(data.someData);
  }
}
```

#### Dependency Injection in Nodes
Nodes are created using a service container, which means we can inject services into their contructor:

``` ts
import { Node, injectable, inject } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  // The controls interface is explained in the 'Controls' section.
  constructor(@inject('controls') private controls: ControlsInterface) {
    super();
  }
}
```

#### Removing a Node From the Scene
To remove a node, call it's `remove()` method. This will remove the node as well as any child nodes. It also calls the node's (and all child nodes') `destroy()` method, which will destroy all game objects and event listeners for those nodes.

### Assets
This framework automatically handles loading assets. To register an asset for loading, we call `registerAsset()`:

``` ts
...
const game = Game.create(1280, 720);

game.registerScene('default', DefaultScene);

game.registerNode('player', PlayerNode);

game.registerAsset('playerSprite', 'assets/playerSprite.png');

// Start game.
game.start();
```

It will be automatically loaded, and available for us to use in nodes:

``` ts
import { Node, injectable } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  public create(): void {
    this.scene.add.image(this.scene.width() / 2, this.scene.height() / 2, 'playerSprite').setScale(0.25);
  }
}
```

Assets can be `.png` files for images, `.ogg` files for audio, and `.json` filed for tiled map editor maps. There is also a special case where if you pass two paths to the `registerAsset()` method, it will load the asset as a texture atlas.

### Controls
Controls are annoying to configure, so this framework has an abstraction for that. To register a control, call the `registerControl()` method:

``` ts
...
const game = Game.create(1280, 720);

// Register scenes and nodes and assets here.
// ...

// Control:
game.registerControl('UP', 'Keyboard.38', 'Gamepad.UP');

// Start game.
game.start();
```

As you can see, we're mapping the string 'UP', to the up arrow key on the keyboard (keycode 38), and the up button on a gamepad. Now in our nodes, we can use the `ControlsInterface` to check in this control is active:

``` ts
import { Node, injectable, inject } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  constructor(@inject('controls') private controls: ControlsInterface) {
    super();
  }

  update(time: number, delta: number): void {
    console.log(controls.isActive('UP'));
  }
}
```

Now if the up arrow key OR up on the gamepad button are pressed, `isActive()` be truth-ey.

### Custom Services
Finally, if we write any custom service we want to `inject()` into our nodes, we can register them like so:

``` ts
...
const game = Game.create(1280, 720);

// Register scenes, nodes, assets, and controls here.
// ...

// Service:
game.registerService<ExampleServiceInterface>('example', ExampleService);

// Start game.
game.start();
```

Now we can inject the `ExampleService` into nodes:

``` ts
import { Node, injectable, inject } from 'phaser-node-framework';

@injectable()
export class PlayerNode extends Node {
  // The controls interface is explained in the 'Controls' section.
  constructor(@inject('example') private exampleService: ExampleServiceInterface) {
    exampleService.foo();
    super();
  }
}
```
