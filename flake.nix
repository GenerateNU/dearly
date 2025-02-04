{
  description = "Dearly Dev";
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    gitignore = {
      url = "github:hercules-ci/gitignore.nix";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };
  outputs = { nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        packages = {
          default = pkgs.hello;
        };

        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            nodejs_22
            docker
            docker-compose
            postgresql
            go-task
            nodePackages.prettier
            google-cloud-sdk
          ];
          shellHook = ''
            chmod +x scripts/bun.sh 
            chmod +x frontend/scripts/mobile.sh
            source scripts/bun.sh 
            source frontend/scripts/mobile.sh
          '';
        };
      });
}
